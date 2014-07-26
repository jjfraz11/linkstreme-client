(function(){
    // Setup Dependencies for Linkstreme Modules. This file must be required first.
  angular.module('LS.chrome', []);
  angular.module('LS.controllers', [ 'LS.chrome' ]);
  angular.module('LS.services', []);

  angular.module('popupApp', ['ui.bootstrap', 'LS.controllers', 'LS.chrome' ]).
    factory('DB', [ '$q', IndexedDB ]).

    factory('LinkStreme', [ '$q', 'DB', 'Uri', LinkStreme ]).
    factory('Shared', [ '$rootScope', 'LinkStreme', Shared ]).
    factory('Uri', [ Uri ]);

  // Services


  // Misc Library Services
  function Uri() {
    return {
      normalize: function(url) {
        return URI.normalize(url);
      },

      parse: function(url) {
        var components = URI.parse(url);

        if( components.errors.length === 0 ) {
          delete components.errors
          components.url = URI.normalize(url);

          return components
        } else {
          alert('Errors: ' + components.errors.join(', '));
        }
      }
    };
  }


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

    return {
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


  // State Services
  function Shared($rootScope, LinkStreme) {
    var state = {};

    var update = function(key, data) {
      var eventName = key + '.update';

      state[key] = data;
      $rootScope.$broadcast(eventName, state[key]);

      alert('Updated ' + key + ' : ' + JSON.stringify(state[key]));
    };

    var register = function($scope, eventName, callback) {
      $scope.$on(eventName, function(event, data) {
        callback(event, data);
      });
    };

    // Register callback to update links when currentStreme updated.
    register($rootScope, 'currentStreme.update', function(event, streme) {
      LinkStreme.getStremeLinks(streme).
        then(function(foundLinks) {
          update('stremeLinks', foundLinks);
        });
    });

    return {
      update: update,
      state: state,
      register: register
    };
  }


  // Helper Services
  function LinkStreme($q, DB, Uri) {
    var getStremeUriKey = function(streme, uri) {
      return 'streme:' + streme.id + '-uri:' + uri.id
    };

    var LS = {};

    LS.Link = {
      create: function(streme, uri) {
        if(!streme.id) {
          alert('No ID for streme: ' + JSON.stringify(streme));
        }

        if(!uri.id) {
          alert('No ID for URI: ' + JSON.stringify(uri));
        }

        var link = {
          streme_id: streme.id,
          uri_id: uri.id,
          streme_uri_key: getStremeUriKey(streme, uri),
        };

        return DB.addTo('links', link);
      }
    };


    LS.Streme = {
      create: function(streme) {
        if(!streme.name) {
          alert('No name found for streme: ' + JSON.stringify(streme));
        }
        streme.links = streme.links || [];

        return DB.addTo('stremes', streme);
      },

      getAll: function() {
        return DB.getAllFrom('stremes');
      },

      getLinks: function(streme) {
        var deferred = $q.defer();

        if (streme.hasOwnProperty('id')) {
          DB.queryFrom('links', {
            index: 'streme_id',
            keyRange: { only: streme.id }
          }).then(function(foundLinks) {
            deferred.resolve(foundLinks);
          }, function(message) {
            deferred.reject(message);
          });
        } else {
          deferred.reject('No ID for streme: ' + JSON.stringify(streme));
        }

        return deferred.promise;
      }
    };

    // URI Helpers
    LS.Uri = {
      create: function(url) {
        var uri = Uri.parse(url);
        return DB.addTo('uris', uri);
      },

      find: function(url) {
        // Get normalized url
        var normUrl = Uri.normalize(url);

        return DB.queryFrom('uris', {
          index: 'url',
          keyRange: {only: normUrl}
        });
      },

      get: function(uri_id) {
        return DB.getFrom('uris', uri_id);
      }
    };

    return {
      // Link Helpers
      createLink: LS.Link.create,

      // Streme Helpers
      createStreme: LS.Streme.create,
      getAllStremes: LS.Streme.getAll,
      getStremeLinks: LS.Streme.getLinks,

      // URI Helpers
      createUri: LS.Uri.create,
      findUri: LS.Uri.find,
      getUri: LS.Uri.get,

      findOrCreateUri: function(url) {
        var createIfMissing = function(foundUris) {
          var deferred = $q.defer();

          // Create URI if none exists
          if (foundUris.length === 0) {
            LS.Uri.create(url).
              then(LS.Uri.get).
              then(function(uri) {
                alert('Added: ' + JSON.stringify(uri));
                deferred.resolve(uri);
              });
          } else {
            deferred.resolve(foundUris[0]);
          }

          return deferred.promise;
        };

        return LS.Uri.find(url).
          then(createIfMissing);
      }

    };
  }

})();
