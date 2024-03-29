'use strict';

(function(){
  angular.module('LS.utilities').
    factory('DB', [ IndexedDB ]).
    factory('StoreBase', [ '$q', 'DB', BuildStoreBase ]);

  function IndexedDB() {
    var db = new Dexie('linkstreme');
    db.version(1).stores({
      links: '++id,&link_key,streme_id,uri_id',
      stremes: '++id,&name',
      entityTags: '++id,&entity_tag_key,tag_id,entity_id,entity_type',
      tags: '++id,&name',
      uris: '++id,&url'
    });

    var Uri = db.uris.defineClass({
      url: String
    });

    var Link = db.links.defineClass({
      link_key:    String,
      streme_id:   Number,
      streme_name: String,
      uri_id:      Number,
      uri_url:     String
    });

    var Streme = db.stremes.defineClass({
      name: String
    });

    var Tag = db.tags.defineClass({
      name: String
    });

    var EntityTag = db.entityTags.defineClass({
      entity_tag_key: String,
      entity_id:      Number,
      entity_type:    String,
      tag_id:         Number
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
        catch(function(message) {
          deferred.reject(message);
        });

      return deferred.promise;
    };

    StoreBase.prototype.delete = function(keyPath) {
      var deferred = $q.defer();
      var self = this;

      if(!keyPath) { alert('Missing keypath: ' + JSON.stringify(keyPath)); }

      this.store.delete(keyPath).
        then(function() {
          console.log('Deleted Item #' + keyPath + ' from ' +
                      self.storeName);
          deferred.resolve();
        }).
        catch(function(message) {
          deferred.reject(message);
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
