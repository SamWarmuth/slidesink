class User < CouchRest::ExtendedDocument
  use_database COUCHDB_SERVER
  
  property :name
  property :email
  property :date_created
  property :activated, :default => false
  
  property :website
  property :about

  def set_password(password)
    self.salt = 64.times.map{|l|('a'..'z').to_a[rand(25)]}.join
    self.password_hash = (Digest::SHA2.new(512) << (self.salt + password + "thyuhwdhlbajhrqmdwxgayegpjxjdomaj")).to_s
  end
  def valid_password?(password)
    return false if (self.password_hash.nil? || self.salt.nil?)
    return ((Digest::SHA2.new(512) << (self.salt + password + "thyuhwdhlbajhrqmdwxgayegpjxjdomaj")).to_s == password_hash)
  end

  property :password_hash
  property :salt
  property :challenges
  
  def shows
    #inefficient. Optimize later.
    return Slideshow.all.find_all{|s| s.user_id == self.id}
  end
  
  property :image_ids, :default => []
end
