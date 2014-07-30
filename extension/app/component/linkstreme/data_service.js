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

    function StremeStore() {
      DB.Store.call(this, 'stremes');

      this.objectName = function(streme) {
        return 'Streme Key: ' + streme.name;
      };

      this.setupNew = function(stremeData) {
        if(!stremeData.name) {
          alert('No name found for streme: ' + JSON.stringify(stremeData));
        }

        var streme = {
          name: stremeData.name,
          links: stremeData.links || []
        };
        return streme;
      };
    }
    StremeStore.prototype = Object.create(DB.Store.prototype);
    StremeStore.prototype.constructor = StremeStore;


    function UriStore() {
      DB.Store.call(this, 'uris');

      this.objectName = function(uri) {
        return 'Uri Key: ' + uri.url;
      };

      this.setupNew = function(uriData) {
        if(!uriData.url) {
          alert('No url found in uriData: ' + JSON.stringify(uriData));
        }

        var normUrl = Uri.normalize(uriData.url);
        var uri = Uri.parse(normUrl);
        return uri;
      };
    }
    UriStore.prototype = Object.create(DB.Store.prototype);
    UriStore.prototype.constructor = UriStore;

    UriStore.prototype.findByUrl = function(url) {
      var deferred = $q.defer();
      // Get normalized url
      var normUrl = Uri.normalize(url);
      var queryOptions = {
        index: 'url',
        keyRange: {only: normUrl}
      };

      this.query(queryOptions).
        then(function(foundUris){
          if (foundUris.length === 0) {
            deferred.reject('No uris found.');
          } else {
            deferred.resolve(foundUris[0]);
          }
        });

      return deferred.promise;
    };

    UriStore.prototype.findOrCreateByUrl = function(url) {
      var deferred = $q.defer();
      var self = this;

      this.findByUrl(url).
        then(function(uri) {
          deferred.resolve(foundUri);
        },function(message) {
          console.log(message);
          self.put({url: url}).
            then(function(uriId) {
              return self.get(uriId)
            }).
            then(function(uri) {
              deferred.resolve(uri);
            });
        });

      return deferred.promise;
    };

    return {
      Links:   new LinkStore,
      Stremes: new StremeStore,
      Uris:    new UriStore,
    };
  }
})();
