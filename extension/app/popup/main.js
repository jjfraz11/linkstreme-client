(function(){
  angular.module('popupApp', []).
    controller('discoverController', [ '$scope', discoverController ]).
    controller('collectController', [ '$scope', 'storage', 'tabs', collectController ]).
    controller('shareController',[ '$scope', shareController]).
    factory('storage', [ '$q', chromeStorage ]).
    factory('tabs', [ '$q', chromeTabs ]);

  function discoverController($scope){
    $scope.url = 'Discover: http://google.com';
  }

  function collectController($scope, storage, tabs){
    function pFail(reason) { alert('Failed: ' + reason); }
    function pNotify(update) { alert('Notify: ' + update); }

    tabs.current().
      then(function(currentTab) {
        if(currentTab) {
          $scope.currentTab = currentTab;

          var link = {};
          link[currentTab.url] = currentTab;
          console.log('Link: ' + link);
          storage.set(link).
            then(function(success) {
              if (success) { console.log('saved link for ' + currentTab.url) };
            }, pFail);
        }
      }, pFail, pNotify);

    tabs.active().
      then(function(activeTabs) {
        if(activeTabs) {
          $scope.activeTabs = activeTabs;
        }
      }, pFail, pNotify);
  }

  function shareController($scope){
    $scope.url = 'Share: http://google.com';
  }

  function chromeStorage($q) {
    var storage;
    // if (type == 'local') {
    if (true) {
      storage = chrome.storage.local;
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

  function chromeTabs($q) {
    return {
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

      active: function() {
        var queryParams = {
          'lastFocusedWindow': true
        };
        var deferred = $q.defer();

        chrome.tabs.query(queryParams, function(tabs){
          if(tabs) {
            angular.forEach(tabs, function(tab) {
              console.log(tab.url);
            });

            deferred.resolve(tabs);
          } else {
            deferred.reject('Tabs ' + tabs + ' is not valid.');
          }
        });

        return deferred.promise;
      }
    }
  }
})();
