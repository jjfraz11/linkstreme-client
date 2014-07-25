(function(){
  angular.module('popupApp', ['ui.bootstrap']).
    controller('StremeSelectCtrl',
               [ '$scope', '$rootScope', '$modal', StremeSelectCtrl ]).
    controller('DiscoverCtrl', [ '$scope', DiscoverCtrl ]).
    controller('CollectCtrl',
               [ '$scope', '$rootScope',
                 'LinkStreme', 'Sessions', 'Tabs', CollectCtrl ]).
    controller('ShareCtrl',[ '$scope', ShareCtrl]).
    factory('DB', [ '$q', IndexedDB ]).
    factory('LinkStreme', [ '$q', 'DB', 'Uri', LinkStreme ]).
    factory('Sessions', [ ChromeSessions ]).
    factory('Storage', [ '$q', ChromeStorage ]).
    factory('Tabs', [ '$q', ChromeTabs ]).
    factory('Uri', [ Uri ]);

  function StremeSelectCtrl($scope, $rootScope, $modal) {
    $scope.currentStreme = { name: 'Select Streme...' };

    $scope.open = function(stremeType) {
      var modalInstance = $modal.open({
        templateUrl: 'streme_select_modal.html',
        controller: StremeSelectModalCtrl,
        resolve: {
          currentStreme: function() { return $scope.currentStreme; },
          stremeType: function () { return stremeType; }
        }
      });

      modalInstance.result.
        then(function(streme) {
          $scope.currentStreme = streme;
          $rootScope.$emit('stremeChange', streme);
        }, function() { console.log('No streme selected.'); });
    }
  }

  function StremeSelectModalCtrl($scope, $modalInstance, DB, currentStreme, stremeType) {
    $scope.currentStreme = currentStreme;
    $scope.stremeType = stremeType;

    $scope.linkstreme = {
      active: ( stremeType == 'linkstreme' ),
      heading: "Linkstreme",
      showNew: false,
      stremes: [],

      add: function(streme) {
        DB.addTo('stremes', streme).
          then(function(streme_id) {
            $scope.linkstreme.showNew = false;
            $scope.linkstreme.updateStremes();
            $scope.linkstreme.select(streme);
          }, function(message) {
            alert(message);
          });
      },

      create: function() {
        $scope.linkstreme.showNew = true;
        $scope.newStreme = {};
      },

      select: function(streme) {
        $scope.currentStreme = streme;
      },

      updateStremes: function() {
        DB.getAllFrom('stremes').
          then(function(stremes) {
            $scope.linkstreme.stremes = stremes;
          }, function(error) {
            alert(error);
          });
      }
    };

    $scope.bookmarks = {
      active: ( stremeType == 'bookmarks' ),
       heading: "Bookmarks"
    };

    $scope.history = {
      active: ( stremeType == 'history' ),
      heading: "History"
    };

    $scope.ok = function() {
      $modalInstance.close($scope.currentStreme);
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('canceled result');
    };

    // Init code
    $scope.linkstreme.updateStremes();
  }

  function DiscoverCtrl($scope){
    $scope.url = 'Discover: http://google.com';
  }

  function CollectCtrl($scope, $rootScope, LinkStreme, Sessions, Tabs){
    // Private methods
    var pFail = function(reason) { alert('Failed: ' + reason); }
    var pNotify = function(update) { alert('Notify: ' + update); }

    // Set current tab
    var setCurrentTab = function() {
      Tabs.current().
        then(function(currentTab) {
          if(currentTab) {
            $scope.currentTab = currentTab;
          }
        }, pFail, pNotify);
    }

    // Set active tabs
    var setActiveTabs = function() {
      // Return standard tab object
      var formatTab = function(tab) {
        return {
          tab_id: tab.id,
          index: tab.index + 1,
          title: tab.title,
          url: tab.url,
          active: tab.highlighted,
          selected: false
        };
      };

      Tabs.active().
        then(function(activeTabs) {
          if(activeTabs) {
            $scope.activeTabs = [];
            angular.forEach(activeTabs, function(tab) {
              $scope.activeTabs.push(formatTab(tab));
            });
          }
        }, pFail, pNotify);
    }

    // Event Handlers
    var unbind = $rootScope.$on('stremeChange', function(event, streme) {
      $scope.currentStreme = streme;
    });
    // Unbind callbacks for this controller defined on $rootScope
    $scope.$on('$destroy', unbind);

    // Scope methods
    $scope.closeTab = function(tab, $event) {
      // Disable click event for close tab element
      $event.stopPropagation();
      Tabs.remove(tab.tab_id).
        then(function(success) {
          if (success)
            setActiveTabs();
          else
            alert('Tab ' + tab.title + ' not closed.');
        });
    }

    $scope.saveLinks = function() {
      if (!$scope.currentStreme) {
        alert('No streme selected.');
        return;
      }

      var createLink = function(uri) {
        return LinkStreme.createLink($scope.currentStreme, uri).
          then(function(link_id) {
            // TODO: Add link_id to links for this streme
            console.log('I should do something with link #' + link_id);
          }, function(message) {
            alert(message);
          });
      };

      // TODO: need to add check for at least one selected tab.
      angular.forEach($scope.activeTabs, function(tab) {
        if(tab.selected) {
          console.log('Selected: ' + tab.title);

          LinkStreme.findOrCreateUri(tab.url).
            then(createLink);
        }
      });
    }

    $scope.toggleTab = function(tab, $event) {
      // Disable click event for checkbox element
      $event.stopPropagation();
      tab.selected = !tab.selected;
    }

    // Todo: prevent user from opening tabs closed before popup opened
    // Todo: prevent reopened tab from gaining focus and closing popup
    $scope.undoCloseTab = function() {
      Sessions.restoreLastTab();
      setActiveTabs();
    }

    // TODO move these methods into an init function
    // Init code
    setCurrentTab();
    setActiveTabs();
  }

  function ShareCtrl($scope){
    $scope.url = 'Share: http://google.com';
  }

  function ChromeStorage($q) {
    var storage;
    // if (type == 'local') {
    if (true) {
      // storage = chrome.storage.local;
    } else {
      alert('Unknown chrome storage type: ' + type);
      return {};
    }

    return {
      get: function(key) {
        var deferred = $q.defer();

        storage.get(key, function(found){
          if(chrome.runtime.lastError) {
            var message = runtime.lastError.message;
            console.log('chromeStorageError: ' + message);
            deferred.reject(message);
          } else {
            console.log('Retrieved data for ' + key);
            deferred.resolve(found)
          }
        });

        return deferred.promise;
      },

      set: function(data) {
        var deferred = $q.defer();

        storage.set(data, function(){
          if(chrome.runtime.lastError) {
            message = runtime.lastError.message;
            console.log('chromeStorageError: ' + message);
            deferred.reject(message);
          } else {
            console.log('Keys: ' + data.keys());
            alert('Saved link for ' + data.keys(0));
            deferred.resolve(true);
          }
        });

        return deferred.promise;
      }
    };
  }

  function ChromeSessions() {
    return {
      restore: function(restoreCallback) {
        chrome.sessions.restore(restoreCallback);
      },

      restoreLastTab: function() {
        chrome.sessions.restore();
      }
    };
  }

  function ChromeTabs($q) {
    return {
      active: function() {
        var queryParams = {
          'lastFocusedWindow': true
        };
        var deferred = $q.defer();

        chrome.tabs.query(queryParams, function(tabs){
          if(tabs) {
            deferred.resolve(tabs);
          } else {
            deferred.reject('Tabs ' + tabs + ' is not valid.');
          }
        });

        return deferred.promise;
      },

      current: function() {
        var queryParams = {
          'active': true,
          'lastFocusedWindow': true
        };
        var deferred = $q.defer();

        chrome.tabs.query(queryParams, function(tabs){
          var tab = tabs[0];
          if(tab) {
            console.log(tab.url);
            deferred.resolve(tab);
          } else {
            deferred.reject('Tab ' + tab + ' is not valid.');
          }
        });

        return deferred.promise;
      },

      remove: function(tab_id) {
        var deferred = $q.defer();

         chrome.tabs.remove(tab_id, function() {
          deferred.resolve(true);
        });

        return deferred.promise;
      },

      update: function(tab_id, options) {
        chrome.tabs.update(tab_id, options);
      }
    };
  }

  function IndexedDB($q) {
    var onStoreReady = function() {
      console.log('Store ready: ' + this.storeName);
    }

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

  function LinkStreme($q, DB, Uri) {
    var LS = {};

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
      createLink: function(streme, uri) {
        var createStremeUriKey = function(streme, uri) {
          return 'streme:' + streme.id + '-uri:' + uri.id
        };

        var link = {
          streme_id: streme.id,
          uri_id: uri.id,
          streme_uri_key: createStremeUriKey(streme, uri),
        };

        return DB.addTo('links', link);
      },


      // URI Helpers
      createUri: LS.Uri.create,

      findUri: LS.Uri.find,

      getUri: LS.Uri.get,

      findOrCreateUri: function(url) {
        var createIfMissing = function(foundUris) {
          // Create URI if none exists
          if (foundUris.length === 0) {
            LS.Uri.create(url).
              then(LS.Uri.get).
              then(function(uri) {
                alert('Added: ' + JSON.stringify(uri));
                return uri;
              });
          } else {
            return foundUris[0];
          }
        };

        return LS.Uri.find(url).
          then(createIfMissing);
      },

      // TODO: flatten out promise chains in below function
      // Reference: http://solutionoptimist.com/2013/12/27/javascript-promise-chains-2/
      // findOrCreateUri: function(url) {
      //   var deferred = $q.defer();
      //   // Search for normalized url in uri store
      //   DB.queryFrom('uris', {
      //     index: 'url',
      //     keyRange: {only: normUrl}
      //   }).then(function(foundUris) {

      //     // Create URI if none exists
      //     if (foundUris.length === 0) {
      //       var uri = Uri.parse(url);
      //       DB.addTo('uris', uri).
      //         then(function(result) {
      //           console.log(result.message + ' : ' + result.keyPath);

      //           // Retrieve created uri using keyPath
      //           DB.getFrom('uris', result.keyPath).
      //             then(function(found) {
      //               alert('Added: ' + JSON.stringify(found));
      //               deferred.resolve(found);
      //             }, function(message) {
      //               // Error if getFrom fails
      //               deferred.reject(message);
      //             });

      //         }, function(message) {
      //           // Error if addTo fails
      //           deferred.reject(message);
      //         });

      //     } else {
      //       // Return existing uri
      //       deferred.resolve(foundUris[0]);
      //     }

      //   }, function(message) {
      //     // Error if queryFrom fails
      //     deferred.reject(message);
      //   });

      //   return deferred.promise;
      // }
    };
  }

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
})();
