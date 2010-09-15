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
  
  get "/save" do
    redirect "/login" unless @user
    if params[:show_id].empty?
      @show = Slideshow.new
      @show.user_id = @user.id
      @show.slides = []
      @show.current_slide = 0
      @show.date_created = Time.now.to_s
    else
      @show = Slideshow.get(params[:show_id])
      redirect "/404" if @show.nil?
      redirect "/show/#{@show.url}" unless @user.id == @show.user_id
    end
    return false if (params[:title].empty? || params[:url].empty?)
    @show.title = params[:title]
    @show.url = params[:url]
    @show.slides = []
    params.to_a.sort_by{|name| name[0].gsub("slide", "").to_i}.each do |name, val|
      if name.include?("slide")
        slide = ShowSlide.new
        slide.markdown = val
        @show.slides << slide
      end
    end
    @show.save
    #Thread.new{Pusher[@show.id].trigger('updateSlides', (haml :show))}
    redirect "/show/#{@show.url}"
  end
  
  post "/save-show" do
    return false unless @user
    return false if (params[:title].empty? || params[:url].empty?)
    if params[:show_id].empty?
      @show = Slideshow.new
      @show.user_id = @user.id
      @show.slides = []
      @show.current_slide = 0
      @show.date_created = Time.now.to_s
    else
      @show = Slideshow.get(params[:show_id])
      redirect "/404" if @show.nil?
      redirect "/show/#{@show.url}" unless @user.id == @show.user_id
    end
    @show.title = params[:title]
    @show.url = params[:url]
    @show.slides = []
    params.to_a.sort_by{|name| name[0].gsub("slide", "").to_i}.each do |name, val|
      if name.include?("slide")
        slide = ShowSlide.new
        slide.markdown = val.gsub("LiNeBrEaK", "\n").gsub("EqUaLs", "=").gsub("aMp", "&").gsub("hAsH", "#")
        @show.slides << slide
      end
    end
    @show.save
    Thread.new{Pusher[@show.id].trigger('updateSlides', (haml :show))}
    return true
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
