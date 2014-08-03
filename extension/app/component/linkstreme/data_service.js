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
        deferred.resolve('No url found: ' + JSON.stringify(linkData));
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

    var saveStreme = function(stremeData) {
      return StremeStore.put(stremeData);
    };

    var loadStremes = function() {
      return StremeStore.getAll();
    };

    var findLinksByStremeId = function(streme_id) {
      var deferred = $q.defer();

      LinkStore.findByStremeId(streme_id).
        then(function(foundLinks) {
          deferred.resolve(foundLinks);
        }, function(message) { deferred.reject(message); });

      return deferred.promise;
    };

    var findTagsByLinkId = function(link_id) {
      var deferred = $q.defer();

      EntityTagStore.findByEntityId(link_id, 'link').
        then(function(foundEntityTags) {
          var getTagPromises = foundEntityTags.map(function(entityTag) {
            TagStore.get(entityTag.tag_id);
          });
          return $q.all(getTagPromises);
        }, function(message) { deferred.reject(message); }).
        then(function(foundTags) {
          deferred.resolve(foundTags);
        }, function(message) { deferred.reject(message); });

      return deferred.promise;
    };

    var saveEntityTag = function(entityTagData) {
      var deferred = $q.defer();
      if(!entityTagData.tag.name) {
        deferred.resolve('No tag name found: ' + JSON.stringify(entityTagData));
      } else {
        TagStore.findOrCreateByName(entityTagData.tag.name).
          then(function(tag) {
            entityTagData.tag.id = tag.id;
            return EntityTagStore.put(entityTagData);
          }).
          then(function(entity_tag_id) {
            return EntityTagStore.get(entity_tag_id);
          }).
          then(function(entity_tag) {
            deferred.resolve(entity_tag);
          }, function(message) { deferred.reject(message); });
      }

      return deferred.promise;
    };

    var resetDatabase = function(storeName) {
    };

    return {
      saveLink:  saveLink,
      saveLinks: saveLinks,
      removeLink: removeLink,
      removeLinks: removeLinks,
      updateStreme: updateStreme,

      saveStreme: saveStreme,
      loadStremes: loadStremes,
      findLinksByStremeId: findLinksByStremeId,

      saveEntityTag: saveEntityTag,
      findTagsByLinkId: findTagsByLinkId,

      resetDatabase: resetDatabase
    };
  }
})();
