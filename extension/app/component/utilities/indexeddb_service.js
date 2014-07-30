'use strict';

(function(){
  angular.module('LS.utilities').
    factory('DB', [ '$q', IndexedDB ]);

  // Database Services
  function IndexedDB($q) {
    var onStoreReady = function() {
      console.log('Store ready: ' + this.storeName);
    }

    var stores = {}

    var getStore = function(storeName) {
      if ( storeName == 'links' ) {
        return stores['links']
      } else if ( storeName == 'stremes' ) {
        return stores['stremes'];
      } else if ( storeName == 'uris' ) {
        return stores['uris'];
      } else { alert( 'Unknown store: ' + storeName); }
    }

    function Store(storeName) {
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

      this.store.put(object, function(keyPath) {
        var objectName = self.objectName(object);
        console.log('Added ' + objectName + ' to ' +
                    self.store.storeName + ' : ' + keyPath);
        deferred.resolve(keyPath);
      }, function() {
        var objectInfo = JSON.stringify(object);
        deferred.reject('Could not add ' + objectInfo +
                        ' to ' + self.store.storeName);
      });

      return deferred.promise;
    };

    Store.prototype.get = function(keyPath) {
      var deferred = $q.defer();
      var self = this;

      if(!keyPath) { alert('Missing keypath: ' + JSON.stringify(keyPath)); }

      this.store.get(keyPath, function(object) {
        deferred.resolve(object);
      }, function() {
        deferred.reject('No object found in ' + self.store.storeName +
                        'with keyPath: ' + keyPath);
      });

      return deferred.promise;
    };

    Store.prototype.getAll = function() {
      var deferred = $q.defer();
      var self = this;

      this.store.getAll(function(objects) {
        deferred.resolve(objects);
      }, function() {
        deferred.reject('Could not retrive objects from ' + self.store.storeName);
      });

      return deferred.promise;
    };

    Store.prototype.query = function(queryOptions) {
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

    Store.prototype.deleteDatabase = function() {
      this.store.deleteDatabase();
      console.log('Delete database for ' + this.store.storeName);
    }
    
    return {
      Store: Store,

      buildStore: function(storeName, storeConfig) {
        storeConfig.storeName = storeName;
        storeConfig.onStoreReady = onStoreReady;
        stores[storeName] = new IDBStore(storeConfig);
      }
    };
  }
})();
