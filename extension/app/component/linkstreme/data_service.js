'use strict';

(function(){
  angular.module('LS.services').
    factory('Data', [ '$q', 'LinkStore', 'StremeStore', 'UriStore', Data ]);

  // Helper Services
  function Data($q, LinkStore, StremeStore, UriStore) {

    var saveLink = function(streme, url) {
      var deferred = $q.defer();

      if (!streme.id) {
        // TODO: Move this back to UI layer
        deferred.reject('No streme selected.');
      } else {

        UriStore.findOrCreateByUrl(url).
          // This function takes a uri and creates a link in currrentStreme
          // It returns a promise that will look up the link_id.
          then(function(uri) {
            var linkData = { streme: streme, uri: uri };
            return LinkStore.put(linkData);
          }).
          then(function(link_id) {
            return LinkStore.get(link_id);
          }).
          then(function(link) {
            deferred.resolve(link);
          }, function(message) {
            deferred.reject(message);
          });
      }

      return deferred.promise;
    };


    return {
      saveLink: saveLink
    };
  }
})();
