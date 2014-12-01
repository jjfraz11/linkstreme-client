'use strict';

(function() {
  angular.module('LS.utilities').
    factory('State', [ '$rootScope', 'Storage', State ]);

  function State($rootScope, Storage) {
    var stateHash = {};

    var init = function(hash) {
      stateHash = hash;
    };

    var validKey = function(key) {
      if (angular.toType(key) === 'array') {
        return true;
      } else if (angular.toType(key) === 'string') {
        return true;
      } else {
        return false;
      }
    };

    var getKeyName = function(key) {
      var keyName;
      if (angular.toType(key) === 'array' ) {
        keyName = key.join('.');
      } else if (angular.toType(key) === 'string' ) {
        keyName = key;
      }

      return keyName;
    };

    var getNestedValue = function(keyArray) {
      return keyArray.reduce(function(result, innerKey) {
        return result[innerKey];
      }, stateHash);
    };

    var setNestedValue = function(keyArray, value){
      var keyArray = keyArray.slice(0);
      var lastKey = keyArray.pop();
      keyArray.reduce(function(result,innerKey) {
        result[innerKey] = result[innerKey] || {};
        return result[innerKey];
      }, stateHash)[lastKey] = value;
    };

    var get = function(key, callback) {
      if(!validKey(key)) {
        alert('Invalid key for State.get: ' + JSON.stringify(key));
        return false;
      }

      var data;
      if (angular.toType(key) === 'array') {
        data = getNestedValue(key);
      } else {
        data = stateHash[key];
      }

      if (callback) { callback(data); }
      return data;
    };

    var set = function(key, data) {
      if(!validKey(key)) {
        alert('Invalid key for State.set: ' + JSON.stringify(key));
        return false;
      }

      if (angular.toType(key) === 'array') {
        setNestedValue(key, data);
      } else {
        stateHash[key] = data;
      }

      var eventName = getKeyName(key) + '.update';
      if(angular.debug) { alert(eventName); }

      $rootScope.$broadcast(eventName, data);
    };

    return {
      init: init,
      get: get,
      set: set,

      save: function(key) {
        var backupData = get(key);
        var keyName = getKeyName(key);
        return Storage.set(keyName, backupData);
      },

      loadSaved: function(key) {
        var keyName = getKeyName(key);

        return Storage.get(keyName).
          then(function(data) {
            set(key, data);
          }, function(message) { alert(message); });
      },

      register: function(scope, eventName, callback) {
        var bindScope = scope || $rootScope;
        return bindScope.$on(eventName, function(event, data) {
          callback(event, data);
        });
      }

    };
  }
})();
