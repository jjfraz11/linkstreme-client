'use strict';

(function() {
  angular.module('LS.models').
    factory('LinkStore', [ '$q', 'Store', BuildLinkStore ]);

  function BuildLinkStore($q, Store) {
    function LinkStore() {
      Store.call(this, 'links');

      var getStremeUriKey = function(streme, uri) {
        return streme.id + ':' + uri.id
      };

      this.objectName = function(link) {
        return 'Link Key: ' + link.streme_uri_key;
      };

      this.setupNew = function(linkData) {
        if(!linkData.streme.id) {
          alert('No ID for streme: ' + JSON.stringify(linkData.streme));
        }

        if(!linkData.uri.id) {
          alert('No ID for URI: ' + JSON.stringify(linkData.uri));
        }

        var link = {
          streme_id: linkData.streme.id,
          uri_id:    linkData.uri.id,
          url:       linkData.uri.url,
          streme_uri_key: getStremeUriKey(linkData.streme, linkData.uri),
        };
        return link;
      };
    }
    LinkStore.prototype = Object.create(Store.prototype);
    LinkStore.prototype.constructor = LinkStore;

    // Should return a list of Uris associated with given links
    LinkStore.prototype.findByStremeId = function(streme_id) {
      if (!streme_id) {
        alert('No streme id given: ' + JSON.stringify(streme_id));
      }
      var deferred = $q.defer();

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
