class Main
  helpers do
    def logged_in?
      return false unless request.cookies.has_key?("user_challenge") && request.cookies.has_key?("user")
      
      @user = User.get(request.cookies['user'])
      return false if @user.nil?
      
      @user = nil unless @user.challenges && @user.challenges.include?(request.cookies['user_challenge'])
      return false if @user.nil?
      
      return true
    end
  end
end
