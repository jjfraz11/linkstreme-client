'use strict';

(function(){
  angular.module('LS.utilities').
    factory('DB', [ '$q', IndexedDB ]);

  // Database Services
  function IndexedDB($q) {
    var onStoreReady = function() {
      console.log('Store ready: ' + this.storeName);
    }

    // Data stores should be created in the LinkStreme service
    var links = new IDBStore({
      dbVersion: 2,
      storeName: 'links',
      keyPath: 'id',
      autoIncrement: true,
      onStoreReady: onStoreReady,

      indexes: [ {
        name: 'streme_id',
        keyPath: 'streme_id',
        unique: false,
        multientry: false
      }, {
        name: 'uri_id',
        keyPath: 'uri_id',
        unique: false,
        multientry: false
      }, {
        name: 'streme_uri_key',
        keyPath: 'streme_uri_key',
        unique: true,
        multientry: false
      }]
    });
    links.objectName = function(link) {
      return 'Link Key: ' + link.streme_uri_key;
    }

    var stremes = new IDBStore({
      dbVersion: 4,
      storeName: 'stremes',
      keyPath: 'id',
      autoIncrement: true,
      onStoreReady: onStoreReady,

      indexes: [ {
        name: 'name',
        keyPath: 'name',
        unique: true,
        multientry: false
      } ]
    });
    stremes.objectName = function(streme) {
      return streme.name;
    }

    var uris = new IDBStore({
      dbVersion: 2,
      storeName: 'uris',
      keyPath: 'id',
      autoIncrement: true,
      onStoreReady: onStoreReady,

      indexes: [ {
        name: 'url',
        keyPath: 'url',
        unique: true,
        multientry: false
      } ]
    });
    uris.objectName = function(uri) {
      return uri.url;
    }

    var getStore = function(storeName) {
      if ( storeName == 'links' ) {
        return links;
      } else if ( storeName == 'stremes' ) {
        return stremes;
      } else if ( storeName == 'uris' ) {
        return uris;
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

    Store.prototype.put = function() {
      var deferred = $q.defer();
      var object = this.setupNew(arguments);

      this.store.put(object, function(keyPath) {
        var objectName = this.objectName(object);
        console.log('Added ' + objectName + ' to ' +
                    this.store.storeName + ' : ' + keyPath);
        deferred.resolve(keyPath);
      }, function() {
        var objectInfo = JSON.stringify(object);
        deferred.reject('Could not add ' + objectInfo +
                        ' to ' + this.store.storeName);
      });

      return deferred.promise;
    };

    Store.prototype.get = function(keyPath) {
      var deferred = $q.defer();

      this.store.get(keyPath, function(object) {
        deferred.resolve(object);
      }, function() {
        deferred.reject('No object found in ' + this.store.storeName +
                        'with keyPath: ' + keyPath);
      });

      return deferred.promise;
    };

    Store.prototype.getAll = function() {
      var deferred = $q.defer();

      this.store.getAll(function(objects) {
        deferred.resolve(objects);
      }, function() {
        deferred.reject('Could not retrive objects from ' + this.store.storeName);
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

    return {
      Store: Store,

      addTo: function(storeName, object) {
        var deferred = $q.defer();
        var store = getStore(storeName);

        store.put(object, function(keyPath) {
          var objectName = store.objectName(object);
          console.log('Added ' + objectName + ' to ' +
                      store.storeName + ' : ' + keyPath);
          deferred.resolve(keyPath);
        }, function() {
          var objectInfo = JSON.stringify(object);
          deferred.reject('Could not add ' + objectInfo +
                          ' to ' + store.storeName);
        });

        return deferred.promise;
      },

      getAllFrom: function(storeName) {
        var deferred = $q.defer();
        var store = getStore(storeName);

        store.getAll(function(objects) {
          deferred.resolve(objects);
        }, function() {
          deferred.reject('Could not retrive objects from ' + store.storeName);
        });

        return deferred.promise;
      },

      getFrom: function(storeName, keyPath) {
        var deferred = $q.defer();
        var store = getStore(storeName);

        store.get(keyPath, function(object) {
          deferred.resolve(object);
        }, function() {
          deferred.reject('No object found in ' + store.storeName +
                          'with keyPath: ' + keyPath);
        });

        return deferred.promise;
      },

      queryFrom: function(storeName, queryOptions) {
        var deferred = $q.defer();
        var store = getStore(storeName);

        if(queryOptions.keyRange) {
          var keyRangeOptions = queryOptions.keyRange;
          queryOptions.keyRange = store.makeKeyRange(keyRangeOptions);
        } else {
          deferred.reject('Must set a keyRange in queryOptions.');
          return deferred.promise;
        }

        store.query(function(objects) {
          deferred.resolve(objects);
        }, queryOptions);

        return deferred.promise;
      }
    };
  }
})();
