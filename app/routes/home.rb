class Main
  get "/" do
    haml :index
  end
  get "/shows/:show_url" do
    logged_in?
    @show = Slideshow.all.find{|s| s.url == params[:show_url]}
    @presenting = false
    @following = false
    haml :index
  end
  get "/shows/:show_url/follow" do
    logged_in?
    @show = Slideshow.all.find{|s| s.url == params[:show_url]}
    @presenting = false
    @following = true
    haml :index
  end
  get "/shows/:show_url/present" do
    redirect "/login" unless logged_in?
    @show = Slideshow.all.find{|s| s.url == params[:show_url]}
    redirect "/404" if @show.nil?
    redirect "/shows/#{params[:show_url]}" unless @user.id == @show.user_id
    @presenting = true
    @following = false
    haml :index
  end
  get "/shows/:show_id/present/slide-change" do
    redirect "/login" unless logged_in?
    @show = Slideshow.get(params[:show_id])
    redirect "/404" if @show.nil?
    redirect "/shows/#{params[:show_url]}" unless @user.id == @show.user_id
    Pusher[@show.id].trigger('slideChange', params[:slide].to_s)
    return ""
  end

  get "/new" do
    redirect "/login" unless logged_in?
    haml :edit
  end
  post "/new" do
    redirect "/login" unless logged_in?
    
    slideshow = Slideshow.new
    slideshow.title = params[:title]
    params[:url] = slideshow.title if params[:url].empty?
    slideshow.url = params[:url]
    slideshow.content = params[:content]
    slideshow.parser = params[:parser].downcase
    slideshow.user_id = @user.id
    slideshow.save
    redirect "/shows/#{slideshow.url}"
  end
  
  get "/edit/:show_url" do
    redirect "/login" unless logged_in?
    @show = Slideshow.all.find{|s| s.url == params[:show_url]}
    redirect "/404" if @show.nil?
    redirect "/shows/#{params[:show_url]}" unless @user.id == @show.user_id
    
    haml :edit
  end
  
  post "/edit" do
    redirect "/login" unless logged_in?
    if params[:show_id].empty?
      @show = Slideshow.new
      @show.user_id = @user.id
    else
      @show = Slideshow.get(params[:show_id])
      redirect "/404" if @show.nil?
      redirect "/shows/#{params[:show_url]}" unless @user.id == @show.user_id
    end
    @show.title = params[:title]
    @show.url = params[:url]
    @show.content = params[:content]
    if @show.parser != params[:parser].downcase
      @show.parser = params[:parser].downcase
      @show.content_checksum = nil
    end
    @show.save
    Pusher[@show.id].trigger('updateSlides', (haml :show))
    redirect "/shows/#{@show.url}"
  end
  
  
  get "/login" do
    redirect "/new" if logged_in?
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
      redirect "/new"
    else
      redirect "/login" #TODO show an error
    end
  end
end
