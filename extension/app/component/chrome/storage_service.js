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

    return {
      get: get,

      // get: function(key) {
      //   var deferred = $q.defer();

      //   chrome.storage.local.get(key, function(found){
      //     if(chrome.runtime.lastError) {
      //       var message = runtime.lastError.message;
      //       console.log('chromeStorageError: ' + message);
      //       deferred.reject(message);
      //     } else {
      //       console.log('Retrieved data for ' + key);
      //       deferred.resolve(found)
      //     }
      //   });

      //   return deferred.promise;
      // },

      // set: function(data) {
      //   var deferred = $q.defer();

      //   chrome.storage.local.set(data, function(){
      //     if(chrome.runtime.lastError) {
      //       message = runtime.lastError.message;
      //       console.log('chromeStorageError: ' + message);
      //       deferred.reject(message);
      //     } else {
      //       console.log('Keys: ' + data.keys());
      //       alert('Saved link for ' + data.keys(0));
      //       deferred.resolve(true);
      //     }
      //   });

      //   return deferred.promise;
      // }
    };
  }
})();
