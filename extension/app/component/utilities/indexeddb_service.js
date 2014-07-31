'use strict';

(function(){
  angular.module('LS.utilities').
    factory('DB', [ IndexedDB ]);

  function IndexedDB() {
    var db = new Dexie('linkstreme');
    db.version(1).stores({
      links: '++id,&streme_uri_key,streme_id,uri_id',
      stremes: '++id,&name',
      uris: '++id,&url'
    });

    var Uri = db.uris.defineClass({
      url: String
    });

    var Link = db.links.defineClass({
      streme_uri_key: String,
      streme_id: Number,
      streme_name: String,
      uri_id: Number,
      uri_url: String
    });

    var Streme = db.stremes.defineClass({
      name: String,
      links: [ Link ]
    });

    db.open();

    return {
      Link: Link,
      Streme: Streme,
      Uri: Uri,

      db: db
    };
  }
})();
