'use strict';

(function() {
  angular.module('LS.models').
    factory('StremeStore', [ '$q', 'DB', BuildStremeStore ]);

  function BuildStremeStore($q, DB) {
    DB.buildStore('stremes', {
      dbVersion: 4,
      keyPath: 'id',
      autoIncrement: true,

      indexes: [ {
        name: 'name',
        keyPath: 'name',
        unique: true,
        multientry: false
      } ]
    });

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

    return new StremeStore;
  }
})();
