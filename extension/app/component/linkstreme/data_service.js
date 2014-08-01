'use strict';

(function(){
  angular.module('LS.services').
    factory('Data', [ '$q', 'EntityTagStore', 'LinkStore', 'StremeStore', 'UriStore',
                      'TagStore', Data ]);

  // Helper Services
  function Data($q, EntityTagStore, LinkStore, StremeStore, UriStore, TagStore) {
    // Collect Data Start

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

    var saveLinks = function(linkDataArray) {
      var savePromises = linkDataArray.map(function(linkData) {
        return saveLink(linkData);
      });

      return $q.all(savePromises);
    };

    var removeLink = function(link_id) {
      return LinkStore.delete(link_id);
    };

    var removeLinks = function(linkIdArray) {
      var removePromises = linkIdArray.map(function(link_id) {
        return removeLink(link_id);
      });

      return $q.all(removePromises);
    };

    var updateStreme = function(linkDataToSave, linkIdsToRemove) {
      var updatePromises = {
        saved: saveLinks(linkDataToSave),
        deleted: removeLinks(linkIdsToRemove)
      };

      return $q.all(updatePromises);
    };

    // Discover Data End


    //  Shared Data Start

    var findLinksByStremeId = function(streme_id) {
      var deferred = $q.defer();

      LinkStore.findByStremeId(streme_id).
        then(function(foundLinks) {
          deferred.resolve(foundLinks);
        }, function(message) { deferred.reject(message); });

      return deferred.promise;
    };

    // Shared Data End


    // Streme Select Data Start

    var saveStreme = function(stremeData) {
      return StremeStore.put(stremeData);
    };

    var loadStremes = function() {
      return StremeStore.getAll();
    };

    // Streme Select Data End

    // var resetDatabase = function(storeName) {
    //   LinkStore.deleteDatabase();
    //   StremeStore.deleteDatabase();
    //   UriStore.deleteDatabase();
    // };

    return {
      findLinksByStremeId: findLinksByStremeId,

      saveLink:  saveLink,
      saveLinks: saveLinks,

      removeLink: removeLink,

      saveStreme: saveStreme,
      loadStremes: loadStremes,
      updateStreme: updateStreme,

      resetDatabase:       function(){} // resetDatabase
    };
  }
})();
