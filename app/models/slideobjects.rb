class SlideObject < Hash
  include CouchRest::CastedModel

  property :left, :default => 0
  property :top, :default => 0
  property :opacity, :default => 1.0
  property :width, :default => "4em"
  property :height, :default => ""
  property :center, :default => false
  
  property :o_id, :default => Proc.new{((Time.now.to_f*10000)%10000000000).to_i} #gross hack to get semi-unique IDs
  
  
  def custom_json
    '"' + self.o_id.to_s + '":{"o_class":"' + self.class.to_s + '", "data":' + self.to_json + "}"
  end
  
  def basic_style
    if self.center
      return "display: block; top: #{self.top}; margin: auto; opacity: #{self.opacity}; width: #{self.width}; height: #{self.height}"
    else
      return "display: block; left: #{self.left}; top: #{self.top}; opacity: #{self.opacity}; width: #{self.width}; height: #{self.height}"
    end
  end
  
end

class SOText < SlideObject
  include CouchRest::CastedModel

  property :color, :default => "#000"
  property :font_size, :default => "1em"
  property :text, :default => ""
  
  def to_html
    return "<div class='slide-object' id='#{self.o_id}' style='#{self.basic_style}; color: #{self.color}; font-size: #{self.font_size};'>#{self.text}</div>"
  end
end

class SOImage < SlideObject
  include CouchRest::CastedModel

  property :src, :default => ""
  property :alt
  
  def to_html
    return "<img class='slide-object' id='#{self.o_id}' src='#{self.src}' alt='#{self.alt}' style='#{self.basic_style};' />"
  end
end

class SOYoutube < SlideObject
  include CouchRest::CastedModel

  property :youtube_url
  
  def to_html
    return "<div class='slide-object' id='#{self.o_id}' style='#{self.basic_style};'> YouTube Not Implemented Yet.</div>"
    
  end
end



