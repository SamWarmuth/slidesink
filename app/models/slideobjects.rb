class SlideObject < Hash
  include CouchRest::CastedModel

  property :left, :default => 0
  property :top, :default => 0
  property :opacity, :default => 1.0
  property :width, :default => "4em"
  property :height, :default => "4em"
  property :center, :default => false
  
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
    return "<div style='#{self.basic_style}; color: #{self.color}; font-size: #{self.font_size};'>#{self.text}</div>"
  end
end

class SOImage < SlideObject
  include CouchRest::CastedModel

  property :src
  property :alt
  
  def to_html
    return "<img src='#{self.src}' alt='#{self.alt}' style='#{self.basic_style};' />"
  end
end

class SOYoutube < SlideObject
  include CouchRest::CastedModel

  property :youtube_url
  
  def to_html
    return "<div style='#{self.basic_style};'> YouTube Not Implemented Yet.</div>"
    
  end
end



