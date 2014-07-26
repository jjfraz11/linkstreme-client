'use strict';

angular.module('Chrome', []).
  factory('Storage', [ '$q', ChromeStorage ]);

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
