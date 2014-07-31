'use strict';

(function(){
  angular.module('LS.services').
    factory('Data', [ '$q', 'LinkStore', 'StremeStore', 'UriStore', Data ]);

  // Helper Services
  function Data($q, LinkStore, StremeStore, UriStore) {

    var saveLink = function(linkData) {
      var deferred = $q.defer();
      if(!linkData.url) {
        deferred.resolve('Invalid url: ' + JSON.stringify(url));
      } else {
        UriStore.findOrCreateByUrl(linkData.url).
          // This function takes a uri and creates a link in currrentStreme
          // It returns a promise that will look up the link_id.
          then(function(uri) {
            linkData.uri = uri;
            return LinkStore.put(linkData);
          }).
          then(function(link_id) {
            return LinkStore.get(link_id);
          }).
          then(function(link) {
            deferred.resolve(link);
          }, function(message) { deferred.reject(message); });
      }

      return deferred.promise;
    };

    var findLinksByStremeId = function(streme_id) {
      var deferred = $q.defer();

      LinkStore.findByStremeId(streme_id).
        then(function(foundLinks) {
          deferred.resolve(foundLinks);
        }, function(message) { deferred.reject(message); });

      return deferred.promise;
    };

    var saveStreme = function(stremeData) {
      return StremeStore.put(stremeData);
    };

    var loadStremes = function() {
      return StremeStore.getAll();
    };

    // var resetDatabase = function(storeName) {
    //   LinkStore.deleteDatabase();
    //   StremeStore.deleteDatabase();
    //   UriStore.deleteDatabase();
    // };

    return {
      findLinksByStremeId: findLinksByStremeId,
      saveLink:            saveLink,

      saveStreme: saveStreme,
      loadStremes: loadStremes,

      resetDatabase:       function(){} // resetDatabase
    };
  }
})();
