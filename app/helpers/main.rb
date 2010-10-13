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


#JUSTIN TV


# Usage:
# Two legged:
# jtv_client = JtvClient.new
# response = jtv_client.get("/user/show/apidemo.xml")
# if response.is_a?(Net::HTTPOK)
#   puts response.body
# end
#
# Three legged, with existing access token:
# jtv_client = JtvClient.new
# jtv_client.post("/user/update.xml", {:title => "My new api set title"}, access_token)
#
# Three legged, requesting a user to authorize access and give you an authorization token:
# jtv_client = JtvClient.new
# request_token = jtv_client.make_request_token
# save_token_to_persistent_storage(request_token)
# redirect_to_or_open_page_in_browser(request_token.authorize_url("http://www.my-api-site.com/on_authorize"))
# ### When the user authorizes, this code should be called:
# request_token = lookup_token_from_persistent_storage_by_key(params["oauth_token"])
# access_token = jtv_client.exchange_request_token_for_access_token(request_token)
# response = jtv_client.get("/account/whoami.xml", access_token)
# if response.is_a?(Net::HTTPOK)
#   user_login = response.body.scan(/<title>(\w+)<\/title>/)[0][0]
#   save_access_token_and_linked_user_account(access_token, user_login)
# end
# jtv_client.post("/user/update.xml", {:title => "My new api set title"}, access_token)

class JtvClient
  # Parameters
  # consumer_key is a string of your API key
  # consumer_secret is a string of your API secret
  def initialize
    @consumer = OAuth::Consumer.new(
      "s3RHcpt0FPdGCugQnq2w", #consumer key
      "zRmn6ptNCrv1z5J6TJbuGXhizKraYkbTlbKpquBeMjo", #consumer secret
      :site => "http://api.justin.tv",
      :http_method => :get
    )
  end

  # Parameters
  # "path" like /user/show/apidemo.xml
  # "access_token" like OAuth::AccessToken
  #    (Alternatively, "user" may .respond_to? each key instead)
  def get(path, access_token=nil)
    (access_token || default_token).get("/api#{path}")
  end

  # Parameters
  # "path" like /stream/register_callback.xml
  # "post_params" like {:event => "stream_up", :channel => "apidemo", :callback_url => ""}
  # "access_token" like OAuth::AccessToken
  #    (Alternatively, "user" may .respond_to? each key instead)
  def post(path, post_params, access_token=nil)
    (access_token || default_token).post("/api#{path}", post_params)
  end

  # Create a request token to be authorized
  # You will send the user to request_token.authorize_url("http://www.my-api-site.com/on_authorize")
  # which will redirect them to your site and add ?oauth_token=XXXXXXXXXXX
  def make_request_token
    @consumer.get_request_token
  end

  # When a user arrives at http://www.my-api-site.com/on_authorize?oauth_token=XXXXXXXXX, look up
  # the request token you had before, and then exchange it for an access token
  def exchange_request_token_for_access_token(request_token)
    request_token.get_access_token
  end

  private
  def default_token
    OAuth::AccessToken.new @consumer
  end
end
