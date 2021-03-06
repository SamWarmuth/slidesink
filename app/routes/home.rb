class Main
  before do
    logged_in?
  end
  get "/" do
    @stream_key = nil
    haml :welcome
  end
  get "/style.css" do
    content_type 'text/css', :charset => 'utf-8'
    return sass :style
    #really kludgy cache
    $style = sass :style if $style.nil?
    $style
  end
  get "/reset" do
    $style = nil
  end
  get "/templates.css" do
    content_type 'text/css', :charset => 'utf-8'
    sass :templates
  end
  get "/404" do
    haml :not_found
  end
  get "/show/?" do
    redirect "/"
  end
  get "/show/:show_url/?" do
    @show = Slideshow.all.find{|s| s.url == params[:show_url]}
    redirect "/404" if @show.nil?
    @presenting = false
    @following = false
    haml :view
  end
  get "/show/:show_url/follow" do
    @show = Slideshow.all.find{|s| s.url == params[:show_url]}
    redirect "/404" if @show.nil?
    jtv_client = JtvClient.new 
    
    @viewer_embed = jtv_client.get("/channel/namespace_embed/#{@show.id}?namespace=sldmrr&height=180&width=240").body
    @presenting = false
    @following = true
    haml :view
  end
  
  get "/show/:show_url/new" do
    redirect "/login" unless @user
    @show = Slideshow.all.find{|s| s.url == params[:show_url]}
    redirect "/404" if @show.nil?
    redirect "/show/#{params[:show_url]}" unless @user.id == @show.user_id
    
    
    
    haml :new_presentation
  end
  
  post "/show/:show_url/present" do
    redirect "/login" unless @user
    redirect "/404" if params[:show_id].nil?
    @show = Slideshow.get(params[:show_id])
    redirect "/404" if @show.nil?
    redirect "/show/#{params[:show_url]}" unless @user.id == @show.user_id
    

    recording = Recording.new
    recording.live = true
    recording.is_private = (params[:private] == "on")
    recording.live_video = (params[:video] == "on")
    recording.live_audio = (params[:audio] == "on")

    recording.save
    
    
    haml :view
  end
  
  get "/show/:show_url/present" do
    redirect "/login" unless @user
    @show = Slideshow.all.find{|s| s.url == params[:show_url]}
    redirect "/404" if @show.nil?
    redirect "/show/#{params[:show_url]}" unless @user.id == @show.user_id
    begin
      jtv_client = JtvClient.new 
      @producer_embed = jtv_client.get("/channel/namespace_publisher_embed.html?channel=#{@show.id}&height=180&width=240").body
    rescue
      puts "jtv not available"
    end
    @presenting = true
    @following = false
    haml :view
  end
  
  get "/show/:show_id/present/slide-change" do
    redirect "/login" unless @user
    @show = Slideshow.get(params[:show_id])
    return "" if @show.nil? || @user.id != @show.user_id
    Thread.new{Pusher[@show.id].trigger('slideChange', params[:slide].to_s)}
    return ""
  end
  get "/user/:user_name" do
    @selected_user = User.all.find{|u| u.name.gsub(" ", "") == params[:user_name]}
    @shows = @selected_user.shows
    redirect "/" if @selected_user.nil?
    haml :user
  end


  get "/settings/?" do
    redirect "/login" unless @user
    haml :settings
  end
  get "/recordings/?" do
    redirect "/login" unless @user
    haml :recordings
  end
  get "/decks/?" do
    redirect "/login" unless @user
    haml :decks
  end
  
  get "/new" do
    redirect "/login" unless @user
    haml :edit
  end
  
  get "/edit/:show_url" do
    redirect "/login" unless @user
    @show = Slideshow.all.find{|s| s.url == params[:show_url]}
    redirect "/404" if @show.nil?
    redirect "/show/#{params[:show_url]}" unless @user.id == @show.user_id
    haml :edit
  end
  
  post "/edit/uploadimage" do
    image = Image.new
    image.name = params[:qqfile].gsub(" ", "")
    extension = image.name.split(".").last
    image.save
    image.url = "/uploads/#{@user.id}/images/#{image.id}.#{extension}"
    image.save
    
    FileUtils.mkdir_p "public/uploads/#{@user.id}/images/"
    
    image.file_path = "public/uploads/#{@user.id}/images/#{image.id}.#{extension}"
    @user.image_ids << image.id
    @user.save
    
    
    data = request.env['rack.input']
    File.open(image.file_path, 'w') {|f| f.write(data.read)}
    return '{"success":true}'
    #"div":"<div class="image-frame" style="display: inline-block; width: 100px; border: 1px solid #999; text-align: center; padding: 5px;"> <div class="image-id" id="#{image.id}" style="display: none"></div> <img src="#{image.url}" style="width: 80px; max-height: 150px;"> <br> #{image.name}</div>"
  end
  
  
  post "/save-show" do
    return "user not found" unless @user
    show_info = params[:info]
    return "no title/url" if (show_info[:title].empty? || show_info[:url].empty?)
    refresh = ""
    if show_info[:show_id].empty?
      @show = Slideshow.new
      @show.user_id = @user.id
      @show.slides = []
      @show.current_slide = 0
      @show.date_created = Time.now.to_s
    else
      @show = Slideshow.get(show_info[:show_id])
      redirect "/404" if @show.nil?
      redirect "/show/#{@show.url}" unless @user.id == @show.user_id
    end
    @show.title = show_info[:title]
    refresh = "/edit/#{show_info[:url]}" if show_info[:url] != @show.url
    @show.url = show_info[:url]
    refresh = "/edit/#{show_info[:url]}" if show_info[:template] != @show.template
    @show.template = show_info[:template]
    @show.slides = []
    params['slides'].sort_by{|s| s[0]}.each do |index, objects|
      slide = Slide.new
      objects.delete("slide_id")
      objects.each_pair do |object_id, object_data|
        object_attributes = object_data['data']
        if object_data['o_class'] == "SOText"
          object = SOText.new
          slide.text_objects << object
        elsif object_data['o_class'] == "SOImage"
          object = SOImage.new
          slide.image_objects << object
        elsif object_data['o_class'] == "SOYoutube"
          object = SOYoutube.new
          slide.youtube_objects << object
        else
          next
        end
        
        object_attributes.each_pair{|name, value| object[name] = value}
      end
      @show.slides << slide
    end
    @show.save
    Thread.new{Pusher[@show.id].trigger('updateSlides', (haml :show))}
    return refresh
  end

  get "/signup" do
    haml :signup, :layout => false
  end
  
  post "/signup" do
    redirect "/signup" if (params[:name].empty? || params[:email].empty? || params[:pass1].empty? || params[:pass2].empty? || (params[:pass1] != params[:pass2]))
    
    user = User.new
    user.name = params[:name]
    user.email = params[:email]
    user.set_password(params[:pass1])
    user.date_created = Time.now.to_s
    user.save
    
    redirect "/"
  end
  
  get "/login" do
    redirect "/user/#{@user.name.gsub(' ','')}" if @user
    haml :login, :layout => false
  end
  
  post "/login" do
    user = User.all.find{|u| u.email == params[:email].downcase}
    
    if user && user.valid_password?(params[:password])
      user.challenges ||= []
      user.challenges << (Digest::SHA2.new(512) << (64.times.map{|l|('a'..'z').to_a[rand(25)]}.join)).to_s
      user.save
      
      response.set_cookie("user", {
        :path => "/",
        :expires => Time.now + 2**20, #two weeks
        :httponly => true,
        :value => user.id
      })
      response.set_cookie("user_challenge", {
        :path => "/",
        :expires => Time.now + 2**20,
        :httponly => true,
        :value => user.challenges.last
      })
      redirect "/"
    else
      redirect "/login" #TODO show an error
    end
  end
  
  get "/logout" do
    response.set_cookie("user", {
      :path => "/",
      :expires => Time.now + 2**20,
      :httponly => true,
      :value => ""
    })
    response.set_cookie("user_challenge", {
      :path => "/",
      :expires => Time.now + 2**20,
      :httponly => true,
      :value => ""
    })
    redirect "/login"
  end
end
