'use strict';

(function(){
  angular.module('LS.chrome').
    factory('Storage', [ '$q', ChromeStorage ]);

  function ChromeStorage($q) {
    var get = function(key) {
      var deferred = $q.defer();

      chrome.storage.local.
        get(key, function(object) {
          if(chrome.runtime.lastError) {
            var message = runtime.lastError.message;
            console.log('chromeStorageError: ' + message);
            deferred.reject(message);
          } else {
            console.log("Loaded '" + key + "' from storage.");
            deferred.resolve(object);
          }
        });

      return deferred.promise;
    };

    var set = function(key, data) {
      var deferred = $q.defer();
      var setData = {};
      setData[key] = JSON.stringify(data);

      chrome.storage.local.
        set(setData, function() {
          if(chrome.runtime.lastError) {
            var message = runtime.lastError.message;
            console.log('chromeStorageError: ' + message);
            deferred.reject(message);
          } else {
            console.log("Saved '" + key + "' to storage");
            deferred.resolve();
          }
        });

      return deferred.promise;
    };

    return {
      get: get,
      set: set,
    };
  }
})();
