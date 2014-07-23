(function(){
  angular.module('popupApp', ['ui.bootstrap']).
    controller('StremeSelectCtrl', [ '$scope', '$modal', 'db', StremeSelectCtrl ]).
    controller('DiscoverCtrl', [ '$scope', DiscoverCtrl ]).
    controller('CollectCtrl',
               [ '$scope', 'db', 'sessions', 'storage', 'tabs', CollectCtrl ]).
    controller('ShareCtrl',[ '$scope', ShareCtrl]).
    factory('db', [ '$q', indexedDB ]).
    factory('sessions', [ chromeSessions ]).
    factory('storage', [ '$q', chromeStorage ]).
    factory('tabs', [ '$q', chromeTabs ]);

  function StremeSelectCtrl($scope, $modal) {
    $scope.selectedStreme = { name: 'Select Streme...' };

    $scope.open = function(stremeType) {
      var modalInstance = $modal.open({
        templateUrl: 'streme_select_modal.html',
        controller: StremeSelectModalCtrl,
        resolve: {
          stremeType: function () { return stremeType; }
        }
      });

      modalInstance.result.
        then(function(streme) {
          $scope.selectedStreme = streme;
        }, function() { console.log('No streme selected.'); });
    }
  }

  function StremeSelectModalCtrl($scope, $modalInstance, db, stremeType) {
    $scope.stremeType = stremeType;

    $scope.selectedStreme = { name: 'Select...' };

    function initNewStreme() {
      $scope.newStreme = {};
    }

    function selectStreme(streme) {
      $scope.selectedStreme = streme;
    };

    $scope.linkstreme = {
      active: ( stremeType == 'linkstreme' ),
      heading: "Linkstreme",
      showNew: false,
      stremes: [],

      add: function(streme) {
        db.addStreme(streme).
          then(function(message) {
            $scope.linkstreme.showNew = false;
            $scope.linkstreme.updateStremes();
            $scope.linkstreme.select(streme);
            console.log(message);
          }, function(message) {
            alert(message);
          });
      },

      create: function() {
        $scope.linkstreme.showNew = true;
        initNewStreme();
      },

      select: function(streme) {
        selectStreme(streme);
      },

      updateStremes: function() {
        db.allStremes().
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
      $modalInstance.close($scope.selectedStreme);
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('canceled result');
    };

    $scope.linkstreme.updateStremes();
  }

  function DiscoverCtrl($scope){
    $scope.url = 'Discover: http://google.com';
  }

  function CollectCtrl($scope, db, sessions, storage, tabs){
    // Private methods
    function pFail(reason) { alert('Failed: ' + reason); }
    function pNotify(update) { alert('Notify: ' + update); }

    // Set current tab
    function setCurrentTab() {
      tabs.current().
        then(function(currentTab) {
          if(currentTab) {
            $scope.currentTab = currentTab;
          }
        }, pFail, pNotify);
    }

    // Set active tabs
    function setActiveTabs() {
      tabs.active().
        then(function(activeTabs) {
          if(activeTabs) {
            $scope.activeTabs = [];
            angular.forEach(activeTabs, function(tab) {
              $scope.activeTabs.push(formatTab(tab));
            });
          }
        }, pFail, pNotify);
    }

    // Return standard tab object
    function formatTab(tab) {
      return {
        tab_id: tab.id,
        index: tab.index + 1,
        title: tab.title,
        url: tab.url,
        active: tab.highlighted,
        selected: false
      }
    }

    // Scope methods
    $scope.addLinks = function() {
      angular.forEach($scope.activeTabs, function(tab) {
        if(tab.selected) {
          console.log('Selected: ' + tab.title);
        }
      });
    }

    $scope.closeTab = function(tab, $event) {
      // Disable click event for close tab element
      $event.stopPropagation();
      tabs.remove(tab.tab_id);
      setActiveTabs();
    }

    $scope.toggleTab = function(tab, $event) {
      // Disable click event for checkbox element
      $event.stopPropagation();
      tab.selected = !tab.selected;
    }

    // Todo: prevent user from opening tabs closed before popup opened
    // Todo: prevent reopened tab from gaining focus and closing popup
    $scope.undoCloseTab = function() {
      sessions.restoreLastTab();
      setActiveTabs();
    }

    // TODO move these methods into an init function
    setCurrentTab();
    setActiveTabs();
  }

  function ShareCtrl($scope){
    $scope.url = 'Share: http://google.com';
  }

  function chromeStorage($q) {
    var storage;
    // if (type == 'local') {
    if (true) {
      // storage = chrome.storage.local;
    } else {
      alert('Unknown chrome storage type: ' + type);
      return {}
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
    }
  }

  function chromeSessions() {
    return {
      restore: function(restoreCallback) {
        chrome.sessions.restore(restoreCallback);
      },

      restoreLastTab: function() {
        chrome.sessions.restore();
      }
    }
  }

  function chromeTabs($q) {
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
        chrome.tabs.remove(tab_id);
      },

      update: function(tab_id, options) {
        chrome.tabs.update(tab_id, options);
      }
    }
  }

  function indexedDB($q) {
    var stremes = new IDBStore({
      dbVersion: 3,
      storeName: 'stremes',
      keyPath: 'id',
      autoIncrement: true,
      onStoreReady: onStoreReady,

      indexes: [ {
        name: 'streme_name',
        keyPath: 'name',
        unique: true,
        multientry: false
      } ]
    });

    var links = new IDBStore({
      dbVersion: 1,
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
      } ]
    });

    function onStoreReady() {
      console.log('Store ready: ' + this.storeName);
    }

    return {
      addStreme: function(streme) {
        var deferred = $q.defer();

        stremes.put(streme, function() {
          deferred.resolve('Added streme: ' + streme.name);
        }, function() {
          deferred.reject('Could not add streme: ' + streme.name);
        });

        return deferred.promise;
      },

      allStremes: function() {
        var deferred = $q.defer();

        stremes.getAll(function(stremes) {
          deferred.resolve(stremes);
        }, function() {
          deferred.reject('Could not get all stremes.');
        });

        return deferred.promise; 
      }
    }
  }
})();
