'use strict';

(function(){
  angular.module('LS.services').
    factory('Data', [ '$q', 'DB', 'Uri', Data ]);

  // Helper Services
  function Data($q, DB, Uri) {

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
          alert('No ID for streme: ' + JSON.stringify(streme));
        }

        if(!linkData.uri.id) {
          alert('No ID for URI: ' + JSON.stringify(uri));
        }

        var link = {
          streme_id: linkData.streme.id,
          uri_id:    linkData.uri.id,
          url:       linkData.uri.url,
          streme_uri_key: getStremeUriKey(linkData.streme, linkData.uri),
        };

        return link
      };
    }
    LinkStore.prototype = Object.create(DB.Store.prototype);
    LinkStore.prototype.constructor = LinkStore;

    // Should return a list of Uris associated with given links
    LinkStore.prototype.getUris = function(link_ids) {
    };


    function UriStore() {
      DB.Store.call(this, 'uris');

      this.objectName = function(uri) {
        return 'Uri Key: ' + uri.url;
      };

      this.setupNew = function(uriData) {
        var normUrl = Uri.normalize(uriData.url);
        var uri = Uri.parse(normUrl);
        return uri;
      };
    }
    UriStore.prototype = Object.create(DB.Store.prototype);
    UriStore.prototype.constructor = UriStore;

    UriStore.prototype.findByUrl = function(url) {
      // Get normalized url
      var normUrl = Uri.normalize(url);
      var queryOptions = {
        index: 'url',
        keyRange: {only: normUrl}
      };

      return this.query(queryOptions);
    };

    UriStore.prototype.findOrCreateByUrl = function(url) {
      var self = this;
      var createIfMissing = function(foundUris) {
        var deferred = $q.defer();

        // Create URI if none exists
        if (foundUris.length === 0) {
          self.create({ url: url }).
            then(function(uri) {
              alert('Added: ' + JSON.stringify(uri));
              deferred.resolve(uri);
            });
        } else {
          deferred.resolve(foundUris[0]);
        }

        return deferred.promise;
      };

      return this.findByUrl(url).
        then(createIfMissing);
    }

    var LS = {};

    LS.Streme = {
      create: function(streme) {
        if(!streme.name) {
          alert('No name found for streme: ' + JSON.stringify(streme));
        }
        streme.links = streme.links || [];

        return DB.addTo('stremes', streme);
      },

      getAll: function() {
        return DB.getAllFrom('stremes');
      },

      getLinks: function(streme) {
        var deferred = $q.defer();

        if (streme.hasOwnProperty('id')) {
          DB.queryFrom('links', {
            index: 'streme_id',
            keyRange: { only: streme.id }
          }).then(function(foundLinks) {
            deferred.resolve(foundLinks);
          }, function(message) {
            deferred.reject(message);
          });
        } else {
          deferred.reject('No ID for streme: ' + JSON.stringify(streme));
        }

        return deferred.promise;
      }
    };

    return {
      Links: new LinkStore,
      Uris: new UriStore,

      // Streme Helpers
      createStreme: LS.Streme.create,
      getAllStremes: LS.Streme.getAll,
      getStremeLinks: LS.Streme.getLinks,
    };
  }
})();
