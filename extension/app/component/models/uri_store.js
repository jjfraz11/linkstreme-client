'use strict';

(function() {
  angular.module('LS.models').
    factory('UriStore', [ '$q', 'StoreBase', 'Uri', BuildUriStore ]);

  function BuildUriStore($q, StoreBase, Uri) {
    function UriStore() {
      StoreBase.call(this, 'uris');

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
    UriStore.prototype = Object.create(StoreBase.prototype);
    UriStore.prototype.constructor = UriStore;

    UriStore.prototype.findByUrl = function(url) {
      var deferred = $q.defer();
      // Get normalized url
      var normUrl = Uri.normalize(url);

      this.store.where('url').equals(normUrl).
        toArray(function(foundUris){
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
          deferred.resolve(uri);
        },function(message) {
          console.log(message);
          self.put({url: url}).
            then(function(uri_id) {
              return self.get(uri_id);
            }).
            then(function(uri) {
              deferred.resolve(uri);
            });
        });

      return deferred.promise;
    };

    return new UriStore;
  }
})();
