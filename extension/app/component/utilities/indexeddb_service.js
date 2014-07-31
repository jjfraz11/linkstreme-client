'use strict';

(function(){
  angular.module('LS.utilities').
    factory('DB', [ IndexedDB ]).
    factory('StoreBase', [ '$q', 'DB', BuildStoreBase ]);

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

  function BuildStoreBase($q, DB) {
    function StoreBase(storeName) {
      this.storeName = storeName;
      this.store = DB.db[storeName];

      this.objectName = function() {
        alert('This method should be overridden by subclasses.');
      };

      this.setupNew = function() {
        alert('This method should be overridden by subclasses.');
      };
    }

    StoreBase.prototype.put = function(objectData) {
      var deferred = $q.defer();
      var object = this.setupNew(objectData);
      var self = this;

      this.store.put(object).
        then(function(keyPath) {
          var objectName = self.objectName(object);
          console.log('Added ' + objectName + ' to ' +
                      self.storeName + ' : ' + keyPath);
          deferred.resolve(keyPath);
        }).
        catch(function() {
          var objectInfo = JSON.stringify(object);
          deferred.reject('Could not add ' + objectInfo +
                          ' to ' + self.storeName);
        });

      return deferred.promise;
    };

    StoreBase.prototype.get = function(keyPath) {
      var deferred = $q.defer();
      var self = this;

      if(!keyPath) { alert('Missing keypath: ' + JSON.stringify(keyPath)); }

      this.store.get(keyPath).
        then(function(object) {
          deferred.resolve(object);
        }).
        catch(function() {
          deferred.reject('No object found in ' + self.store.storeName +
                          'with keyPath: ' + keyPath);
        });

      return deferred.promise;
    };

    StoreBase.prototype.getAll = function() {
      var deferred = $q.defer();
      var self = this;

      this.store.toCollection().toArray(function(objects) {
        deferred.resolve(objects);
      }, function() {
        deferred.reject('Could not retrive objects from ' + self.store.storeName);
      });

      return deferred.promise;
    };

    return StoreBase
  }
})();
