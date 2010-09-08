class Slideshow < CouchRest::ExtendedDocument
  use_database COUCHDB_SERVER
  
  property :title
  property :url
  property :user_id
  
  property :content
  property :content_checksum
  property :content_type
  
  property :generated
  
  property :date_created
  
  property :events #array: [[ms_from_start, event_type], ...]
  
  save_callback :before, :regenerate_presentation
  
  
  def regenerate_presentation
    return false if content.nil?
    current_checksum = (Digest::SHA2.new(512) << self.content).to_s
    return true if self.content_checksum == current_checksum
    self.content_checksum = current_checksum
    self.generated = Kramdown::Document.new(self.content).to_html
    self.save
  end
  
end