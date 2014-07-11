(function(){
  angular.module('popupApp', []).
    controller('discoverController', [ '$scope', discoverController ]).
    controller('collectController', [ '$scope', 'indexDB', collectController ]).
    controller('shareController',[ '$scope', shareController]).
    factory('indexDB', [ indexDB ]);

  function discoverController($scope){
    $scope.url = 'Discover: http://google.com';
  }

  function collectController($scope, database){
    function currentUrl() {
      var queryParams = {
        'active': true,
        'lastFocusedWindow': true
      };
      chrome.tabs.query(queryParams, function(tabs){
        return tabs[0].url;
      });
    }

    $scope.data = database.print();
    $scope.url = 'Collect: ' + currentUrl();
  }

  function shareController($scope){
    $scope.url = 'Share: http://google.com';
  }

  function indexDB() {
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
})();
