class Slideshow < CouchRest::ExtendedDocument
  use_database COUCHDB_SERVER
  
  property :title
  property :url
  property :user_id
  
  property :template
  
  property :deleted
  
  property :slides, :cast_as => ['ShowSlide'] # markdown, html, checksum
  
  property :current_slide
  property :date_created
  property :last_edited
  
  property :recordings #array: [[ms_from_start, event_type], ...]
  
  save_callback :before, :regenerate_presentation
  
  def force_regen
    self.slides.each{|slide| slide.checksum = nil}
    self.save
  end
  
  def regenerate_presentation
    return false if slides.nil? || slides.empty?
    self.slides.each do |slide|
      checksum = (Digest::SHA2.new(512) << slide.markdown).to_s
      next if slide.checksum == checksum
      
      slide.checksum = checksum
      slide.html = Kramdown::Document.new(slide.markdown).to_html
    end
  end
  
  def delete
    self.deleted = true
    self.save
  end
end

class ShowSlide < Hash
  include CouchRest::CastedModel

  property :markdown
  property :checksum
  property :html
  
  
end