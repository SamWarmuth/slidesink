class Slideshow < CouchRest::ExtendedDocument
  use_database COUCHDB_SERVER
  
  property :title
  property :url
  property :user_id
  
  property :template
  
  property :deleted, :default => false
  
  property :slides, :cast_as => ['ShowSlide'], :default => []
  
  property :current_slide
  property :date_created
  property :last_edited
  
  property :recordings #array: [[ms_from_start, event_type], ...]
  
  save_callback :before, :regenerate_presentation
  
  def regenerate_presentation
    return false if slides.nil? || slides.empty?
    self.slides.each do |slide|
      #checksum = (Digest::SHA2.new(512) << slide.markdown).to_s
      #next if slide.checksum == checksum
      
      #slide.checksum = checksum
      slide.generate_html
    end
  end
  
  def delete
    self.deleted = true
    self.save
  end
end

class ShowSlide < Hash
  include CouchRest::CastedModel

  property :text_objects,  :cast_as => ['SOText']
  property :image_objects,  :cast_as => ['SOImage']
  property :youtube_objects,  :cast_as => ['SOYoutube']
  
  def objects
    return self.text_objects + self.image_objects + self.youtube_objects
  end
  
  property :html
  
  def generate_html
    self.html = objects.map{|o| o.to_html}.join("\n")
  end
end