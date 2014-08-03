'use strict';

(function() {
  angular.module('LS.models').
    factory('LinkStore', [ '$q', 'StoreBase', BuildLinkStore ]);

  function BuildLinkStore($q, StoreBase) {
    function LinkStore() {
      StoreBase.call(this, 'links');

      var getLinkKey = function(streme, uri) {
        return streme.id + ':' + uri.id
      };

      this.objectName = function(link) {
        return 'Link Key: ' + link.link_key;
      };

      this.setupNew = function(linkData) {
        if(!linkData.streme.id) {
          alert('No ID for streme: ' + JSON.stringify(linkData.streme));
        }

        if(!linkData.uri.id) {
          alert('No ID for URI: ' + JSON.stringify(linkData.uri));
        }

        var link = {
          link_key:    getLinkKey(linkData.streme, linkData.uri),
          streme_id:   linkData.streme.id,
          streme_name: linkData.streme.name,
          uri_id:      linkData.uri.id,
          uri_url:     linkData.uri.url
        };
        return link;
      };
    }
    LinkStore.prototype = Object.create(StoreBase.prototype);
    LinkStore.prototype.constructor = LinkStore;

    // Should return a list of Uris associated with given links
    LinkStore.prototype.findByStremeId = function(streme_id) {
      var deferred = $q.defer();

      if (!streme_id) {
        deferred.reject('No streme id given: ' + JSON.stringify(streme_id));
        return deferred.promise;
      }

      this.store.where('streme_id').equals(streme_id).
        toArray(function(foundLinks) {
          deferred.resolve(foundLinks);
        }).
        catch(function(message) {
          deferred.reject(message);
        });

      return deferred.promise;
    };

    return new LinkStore;
  }
})();
