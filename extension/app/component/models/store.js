'use strict';

(function() {
  angular.module('LS.models').
    factory('Store', [ '$q', 'DB', BuildStore ]);
  
  function BuildStore($q, DB) {
    function Store(storeName) {
      var stores = {}

      var getStore = function(storeName) {
        if ( storeName == 'links' ) {
          return DB.db.links;
          //return stores['links']
        } else if ( storeName == 'stremes' ) {
          return DB.db.stremes;
          // return stores['stremes'];
        } else if ( storeName == 'uris' ) {
          return DB.db.uris;
          // return stores['uris'];
        } else { alert( 'Unknown store: ' + storeName); }
      }
      this.storeName = storeName;
      this.store = getStore(storeName);

      this.objectName = function() {
        alert('This method should be overridden by subclasses.');
      };

      this.setupNew = function() {
        alert('This method should be overridden by subclasses.');
      };
    }

    Store.prototype.put = function(objectData) {
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

    Store.prototype.get = function(keyPath) {
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

    Store.prototype.getAll = function() {
      var deferred = $q.defer();
      var self = this;

      this.store.toCollection().toArray(function(objects) {
        deferred.resolve(objects);
      }, function() {
        deferred.reject('Could not retrive objects from ' + self.store.storeName);
      });

      return deferred.promise;
    };

    Store.prototype.oldQuery = function(queryOptions) {
      var deferred = $q.defer();

      if(queryOptions.keyRange) {
        var keyRangeOptions = queryOptions.keyRange;
        queryOptions.keyRange = this.store.makeKeyRange(keyRangeOptions);

        this.store.query( function(objects) { deferred.resolve(objects); },
                          queryOptions );
      } else {
        deferred.reject('Must set a keyRange in queryOptions.');
      }

      return deferred.promise;
    };

    return Store
  }
})()
