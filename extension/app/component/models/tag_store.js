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

    return new TagStore;
  }
})();
