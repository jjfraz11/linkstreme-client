'use strict';

(function() {
  angular.module('LS.models').
    factory('TagStore', [ '$q', 'StoreBase', BuildTagStore ]);

  function BuildTagStore($q, StoreBase) {
    function TagStore() {
      StoreBase.call(this, 'tags');

      this.objectName = function(tag) {
        return 'Tag Key: ' + tag.name;
      };

      this.setupNew = function(tagData) {
        if(!tagData.name) {
          alert('No name for tag: ' + JSON.stringify(tagData.name));
        }

        var tag = {
          name: tagData.name
        };
        return tag;
      };
    }
    TagStore.prototype = Object.create(StoreBase.prototype);
    TagStore.prototype.constructor = TagStore;

    TagStore.prototype.findByName = function(tag_name) {
      var deferred = $q.defer();

      this.store.where('name').equals(tag_name).
        toArray(function(foundTags) {
          if (foundTags.length === 0) {
            deferred.reject('No tags found.');
          } else {
            deferred.resolve(foundTags[0]);
          }
        });

      return deferred.promise;
    };

    TagStore.prototype.findOrCreateByName = function(tag_name) {
      var deferred = $q.defer();
      var self = this;

      this.findByName(tag_name).
        then(function(tag) {
          deferred.resolve(tag);
        }, function(message) {
          console.log(message);
          self.put({name: tag_name}).
            then(function(tag_id) {
              return self.get(tag_id);
            }).
            then(function(tag) {
              deferred.resolve(tag);
            });
        });

      return deferred.promise;
    };

    return new TagStore;
  }
})();
