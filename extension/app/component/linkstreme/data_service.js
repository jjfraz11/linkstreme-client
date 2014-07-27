'use strict';

(function(){
  angular.module('LS.services').
    factory('Data', [ '$q', 'DB', 'Uri', Data ]);

  // Helper Services
  function Data($q, DB, Uri) {
    var getStremeUriKey = function(streme, uri) {
      return 'streme:' + streme.id + '-uri:' + uri.id
    };

    var LS = {};

    LS.Link = {
      create: function(streme, uri) {
        if(!streme.id) {
          alert('No ID for streme: ' + JSON.stringify(streme));
        }

        if(!uri.id) {
          alert('No ID for URI: ' + JSON.stringify(uri));
        }

        var link = {
          streme_id: streme.id,
          uri_id: uri.id,
          streme_uri_key: getStremeUriKey(streme, uri),
        };

        return DB.addTo('links', link);
      },

      get: function(link_id) {
        return DB.getFrom('links', link_id);
      }
    };


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

    // URI Helpers
    LS.Uri = {
      create: function(url) {
        var uri = Uri.parse(url);
        return DB.addTo('uris', uri);
      },

      find: function(url) {
        // Get normalized url
        var normUrl = Uri.normalize(url);

        return DB.queryFrom('uris', {
          index: 'url',
          keyRange: {only: normUrl}
        });
      },

      get: function(uri_id) {
        return DB.getFrom('uris', uri_id);
      }
    };

    return {
      // Link Helpers
      createLink: LS.Link.create,
      getLink: LS.Link.get,

      // Streme Helpers
      createStreme: LS.Streme.create,
      getAllStremes: LS.Streme.getAll,
      getStremeLinks: LS.Streme.getLinks,

      // URI Helpers
      createUri: LS.Uri.create,
      findUri: LS.Uri.find,
      getUri: LS.Uri.get,

      findOrCreateUri: function(url) {
        var createIfMissing = function(foundUris) {
          var deferred = $q.defer();

          // Create URI if none exists
          if (foundUris.length === 0) {
            LS.Uri.create(url).
              then(LS.Uri.get).
              then(function(uri) {
                alert('Added: ' + JSON.stringify(uri));
                deferred.resolve(uri);
              });
          } else {
            deferred.resolve(foundUris[0]);
          }

          return deferred.promise;
        };

        return LS.Uri.find(url).
          then(createIfMissing);
      }

    };
  }
})();
