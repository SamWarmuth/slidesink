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
      slide.generate_html
    end
  end
  
  def delete
    self.deleted = true
    self.save
  end
  
  def custom_json
    out = self.slides.map do |slide|
      slide.custom_json
    end
    return "{" + out.join(",") + "}"
  end
end

class ShowSlide < Hash
  include CouchRest::CastedModel

  property :text_objects,  :cast_as => ['SOText'], :default => []
  property :image_objects,  :cast_as => ['SOImage'], :default => []
  property :youtube_objects,  :cast_as => ['SOYoutube'], :default => []
  
  property :s_id, :default => Proc.new{((Time.now.to_f*10000)%10000000000).to_i}
  
  def objects
    return self.text_objects + self.image_objects + self.youtube_objects
  end
  
  def custom_json
   '"' + self.s_id.to_s + '":{' + self.objects.map{|object| object.custom_json}.join(",") + "}"
  end
  
  property :html
  
  def generate_html
    self.html = objects.map{|o| o.to_html}.join("\n")
  end
end