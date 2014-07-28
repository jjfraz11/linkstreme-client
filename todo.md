* Discover
  Tools for finding links of interest
  * Search - enter keyword and find related links / stremes
    * Objects: keyword, link, streme
    * Services: search engine
  * Find related - find links / stremes related to an input link / streme
    * Objects: link, streme
    * Services: find engine?
  * Explore - browse streme graph, and show links related to selected link
    * Objects: link, streme, streme graph
    * Services: graph explorer
    * Highlights connections to other links in the streme graph

	
* Collect
  Tools for selecting and grouping links of interest
  * Bookmark - add one or more links to streme
    * Objects: bookmark link, streme
    * Services: bookmarker
  * Load History - add sites in browsing history to visited streme
    * Objects: historic link, visited streme
    * Services: history loader
  * Record - automatically add sites to visited streme while browsing
    * Objects: recorded link, visited streme
    * Services: recorder
  * Annotate - add notes about a link
    * Objects: note, link
    * Services: annotator
  * Tag - add tags to describe a link
    * Objects: tag, link
    * Services: tagger
  * Manage Stremes - create stremes and organize links within them
    * Objects: link, streme
    * Services: streme manager

 
* Share
  Tools for sharing links and stremes with others
  * Connect - find users and manage relationships
    * Objects: user, relationship (polymorphic)
    * Services: 
  * Publish - make stremes discoverable by specified audiences
    * Objects: user, streme, audience, publication
    * Services:
  * Subscribe - follow user and be notified of newly published stremes
    * Objects: user, streme, subscription, notification, stremelist 
  * Share - send a selected link / streme to a specified user
    * Objects: user, link, streme, notification, stremelist


* Data Schema
  * Keyword
   
  * User
   
  * Session

  * URI - descriptive data for a web resource
    * ID
    * Title
    * Domain
    * Subdomain
    * Path
    * Query
    * Resource Type
    * Keywords - foreign key list
    * Last visited

  * Link - join data for a URI in a Streme
    * Name
    * URI - Web resource being referenced, foreign key
    * Streme - Streme being referenced, foreign key
    * Created at
    * Updated at
    * Order
    * Tags - foreign key list
    * Type (bookmark, history, recorder)
    * Comment

  * Streme - collection of links
    * Name
    * Source Type
    * Visibility
    * User - foreign key
    * Created At Session - foreign key
    * Created At
    * Updated At
    * Links - foreign key list
    * Name 
    * Tags - foreign key list

  * Tag
    * value