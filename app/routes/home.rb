class Main
  get "/" do
    haml :index
  end
  get "/shows/:show_url" do
    @show = Slideshow.all.find{|s| s.url == params[:show_url]}
    haml :index
  end
  get "/new" do
    redirect "/login" unless logged_in?
    haml :new
  end
  post "/new" do
    redirect "/login" unless logged_in?
    
    slideshow = Slideshow.new
    slideshow.title = params[:title]
    slideshow.url = params[:url]
    slideshow.content = params[:content]
    slideshow.user_id = @user.id
    slideshow.save
    redirect "/"
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
    slideshow = Slideshow.get(params[:show_id])
    redirect "/404" if slideshow.nil?
    redirect "/shows/#{params[:show_url]}" unless @user.id == slideshow.user_id
    
    slideshow.title = params[:title]
    slideshow.url = params[:url]
    slideshow.content = params[:content]
    slideshow.save
    redirect "/shows/#{slideshow.url}"
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
