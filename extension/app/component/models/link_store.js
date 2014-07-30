'use strict';

(function() {
  angular.module('LS.models').
    factory('LinkStore', [ '$q', 'DB', BuildLinkStore ]);

  function BuildLinkStore($q, DB) {
    function LinkStore() {
      DB.Store.call(this, 'links');

      var getStremeUriKey = function(streme, uri) {
        return 'streme:' + streme.id + '-uri:' + uri.id
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
    LinkStore.prototype = Object.create(DB.Store.prototype);
    LinkStore.prototype.constructor = LinkStore;

    // Should return a list of Uris associated with given links
    LinkStore.prototype.findByStremeId = function(stremeId) {
      if (!stremeId) {
        alert('No streme id given: ' + JSON.stringify(stremeId));
      }
      var deferred = $q.defer();
      var queryOptions = {
        index: 'streme_id',
        keyRange: { only: stremeId }
      };

      this.query(queryOptions).
        then(function(foundLinks) {
          deferred.resolve(foundLinks);
        }, function(message) {
          deferred.reject(message);
        });

      return deferred.promise;
    };

    return new LinkStore;
  }
})();
