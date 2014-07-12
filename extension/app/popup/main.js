(function(){
  angular.module('popupApp', []).
    controller('discoverController', [ '$scope', discoverController ]).
    controller('collectController', [ '$scope', 'database', 'tabs', collectController ]).
    controller('shareController',[ '$scope', shareController]).
    factory('database', [ indexDbService ]).
    factory('tabs', [ '$q', tabService ]);

  function discoverController($scope){
    $scope.url = 'Discover: http://google.com';
  }

  function collectController($scope, database, tabs){
    function pFail(reason) { alert('Failed: ' + reason); }
    function pNotify(update) { alert('Notify: ' + update); }

    tabs.current().
      then(function(currentTab) {
        if(currentTab) {
          $scope.currentTab = currentTab;
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

  function indexDbService() {
    var db = null;
    var version = 1;

    return {
      print: function() { console.log("i did it."); },
      open: function(){
	var request = indexedDB.open("linkstreme", version);
	
	// We can only create Object stores in a versionchange transaction.
	request.onupgradeneeded = function(e) {
	  var db = e.target.result;
	  
	  // A versionchange transaction is started automatically
	  e.target.transaction.onerror = $scope.indexedDB.onerror;
	  
	  if (db.objectStoreNames.contains("bookmarks")) {
	    db.deleteObjectStore("bookmarks");
	  }
	  
	  var store = db.createObjectStore("bookmarks", {keyPath: "timeStamp"});
	};

	request.onsuccess = function(e) {
	  $scope.indexedDB.db = e.target.result;
	};
	request.onerror = $scope.indexedDB.onerror;
      },
    }
  }

  function tabService($q) {
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
