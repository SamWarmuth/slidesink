class Image < CouchRest::ExtendedDocument
  use_database COUCHDB_SERVER
  
  property :name
  property :url
  property :file_path
  property :date_created
  
end