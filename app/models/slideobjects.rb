class SlideObject < Hash
  include CouchRest::CastedModel

  property :left, :default => 0
  property :top, :default => 0
  property :opacity, :default => 1.0
  property :width, :default => "20%"
  property :height, :default => "15%"
  property :z_index, :default => 1
  property :background_color, :default => "transparent"
  property :o_id, :default => Proc.new{((Time.now.to_f*10000)%10000000000).to_i} #gross hack to get semi-unique IDs
  
  def custom_json
    '"' + self.o_id.to_s + '":{"o_class":"' + self.class.to_s + '", "data":' + self.to_json + "}"
  end
  
  def basic_style
    return "display: block; position: absolute; left: #{self.left}; top: #{self.top}; opacity: #{self.opacity}; width: #{self.width}; height: #{self.height}; z-index: #{self.z_index}; background-color: #{self.background_color}"
  end
  
end

class SOText < SlideObject
  include CouchRest::CastedModel

  property :color, :default => "#000"
  property :font_size, :default => "1.5em"
  property :contents, :default => ""
  property :text_align, :default => "left"
  property :font_weight, :default => "normal"
  property :font_style, :default => "normal"
  property :text_decoration, :default => "none"
  
  def to_html
    return "<div class='slide-object' id='#{self.o_id}' style='#{self.basic_style}; text-align: #{self.text_align}; font-size: #{self.font_size};'><div style='color: #{self.color}; font-weight: #{self.font_weight}; font-style: #{self.font_style}; text-decoration: #{self.text_decoration};' class='content'>#{self.contents}</div></div>"
  end
end

class SOImage < SlideObject
  include CouchRest::CastedModel

  property :src, :default => ""
  property :alt
  
  def to_html
    return "<div class='slide-object' id='#{self.o_id}' style='#{self.basic_style};'> <img src='#{self.src}' alt='#{self.alt}' style='width: 100%; height: 100%;' /></div>"
  end
end

class SOYoutube < SlideObject
  include CouchRest::CastedModel

  property :youtube_url
  
  def to_html
    return "<div class='slide-object' id='#{self.o_id}' style='#{self.basic_style};'> <object class='vidobject' width='100%' height='100%'><param name='movie' value='#{self.youtube_url}'></param><param name='allowFullScreen' value='true'></param><param name='allowscriptaccess' value='always'></param><embed src='#{self.youtube_url}' type='application/x-shockwave-flash' allowscriptaccess='always' allowfullscreen='true' width='100%' height='100%'></embed></object></div>"
    
  end
end



