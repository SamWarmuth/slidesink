class Recording < CouchRest::ExtendedDocument
  use_database COUCHDB_SERVER
  
  property :show_id
  
  property :date_created, :default => Time.now.to_s
  property :public, :default => true
  
  property :live
  
  property :live_video, :default => false
  property :recorded_video, :default => false
  property :live_audio, :default => false
  property :recorded_audio, :default => false
  
  property :slide_transitions, :cast_as => ['Transition'], :default => []
end


class Transition < Hash
  include CouchRest::CastedModel
  
  property :time, :default => Time.now.to_s
  property :slide
  
end