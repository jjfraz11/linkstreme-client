'use strict';

(function() {
  angular.module('LS.models').
    factory('EntityTagStore', [ '$q', 'StoreBase', BuildEntityTagStore ]);

  function BuildEntityTagStore($q, StoreBase) {
    function EntityTagStore() {
      StoreBase.call(this, 'entityTags');

      var getEntityTagKey = function(entity, tag) {
        return entity.type + ':' + entity.id + ':' + tag.id
      };

      this.objectName = function(entityTag) {
        return 'Entity Tag Key: ' + entityTag.entity_tag_key;
      };

      this.setupNew = function(entityTagData) {
        if(!entityTagData.entity.id || !entityTagData.entity.type) {
          alert('Missing entity type or id: ' + JSON.stringify(entityTagData.entity));
        }

        if(!entityTagData.tag.id) {
          alert('No ID for Tag: ' + JSON.stringify(entityTagData.tag));
        }

        var entityTag = {
          entity_tag_key: getEntityTagKey(entityTagData.entity, entityTagData.tag),
          entity_id:   entityTagData.entity.id,
          entity_type: entityTagData.entity.type,
          tag_id:      entityTagData.tag.id
        };
        return entityTag;
      };
    }
    EntityTagStore.prototype = Object.create(StoreBase.prototype);
    EntityTagStore.prototype.constructor = EntityTagStore;

    EntityTagStore.prototype.findByEntityId = function(entity_id, entity_type) {
      if (!entity_id || !entity_type) {
        alert('Missing entity type or id: ' +
              JSON.stringify({entity_id: entity_id, entity_type: entity_id}));
      }
      var deferred = $q.defer();

      this.store.where('entity_id').equals(entity_id).
        and(function(entityTag) {
          return ( entityTag.entity_type === entity_type )
        }).
        toArray(function(foundEntityTags) {
          deferred.resolve(foundEntityTags);
        }).
        catch(function(message) {
          deferred.reject(message);
        });

      return deferred.promise;
    };

    // Should return a list of entity tags associated with given tag_id
    EntityTagStore.prototype.findByTagId = function(tag_id) {
      if (!tag_id) {
        alert('No tag id given: ' + JSON.stringify(tag_id));
      }
      var deferred = $q.defer();

      this.store.where('tag_id').equals(tag_id).
        toArray(function(foundEntityTags) {
          deferred.resolve(foundEntityTags);
        }).
        catch(function(message) {
          deferred.reject(message);
        });

      return deferred.promise;
    };

    return new EntityTagStore;
  }
})();
