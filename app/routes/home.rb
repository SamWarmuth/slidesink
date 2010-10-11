class Main
  before do
    logged_in?
  end
  get "/" do
    haml :welcome
  end
  get "/style.css" do
    content_type 'text/css', :charset => 'utf-8'
    sass :style
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
  get "/show/:show_url" do
    @show = Slideshow.all.find{|s| s.url == params[:show_url]}
    redirect "/404" if @show.nil?
    @presenting = false
    @following = false
    haml :index
  end
  get "/show/:show_url/follow" do
    @show = Slideshow.all.find{|s| s.url == params[:show_url]}
    redirect "/404" if @show.nil?
    @presenting = false
    @following = true
    haml :index
  end
  get "/show/:show_url/present" do
    redirect "/login" unless @user
    @show = Slideshow.all.find{|s| s.url == params[:show_url]}
    redirect "/404" if @show.nil?
    redirect "/show/#{params[:show_url]}" unless @user.id == @show.user_id
    @presenting = true
    @following = false
    haml :index
  end
  get "/show/:show_id/present/slide-change" do
    redirect "/login" unless @user
    @show = Slideshow.get(params[:show_id])
    return "" if @show.nil?
    redirect "/show/#{params[:show_url]}" unless @user.id == @show.user_id
    Thread.new{Pusher[@show.id].trigger('slideChange', params[:slide].to_s)}
    return ""
  end
  get "/user/:user_name" do
    @selected_user = User.all.find{|u| u.name.gsub(" ", "") == params[:user_name]}
    @shows = Slideshow.all.find_all{|s| s.user_id == @selected_user.id}
    redirect "/" if @selected_user.nil?
    haml :user
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
    image.url = "/uploads/#{@user.id}/#{image.id}.#{extension}"
    image.save
    
    FileUtils.mkdir_p "public/uploads/#{@user.id}/"
    
    image.file_path = "public/uploads/#{@user.id}/#{image.id}.#{extension}"
    @user.image_ids << image.id
    @user.save
    
    
    data = request.env['rack.input']
    File.open(image.file_path, 'w') {|f| f.write(data.read)}
    return '{"success":true}'
  end
  
  
  post "/save-show" do
    return false unless @user
    show_info = params[:info]
    return false if (show_info[:title].empty? || show_info[:url].empty?)
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
