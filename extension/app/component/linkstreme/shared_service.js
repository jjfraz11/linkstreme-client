'use strict';

(function(){
  angular.module('LS.services').
    factory('Shared', [ '$rootScope', 'Data', 'Storage', Shared ]);

  function Shared($rootScope, Data, Storage) {

    var state = (function() {
      var stateHash = {
        currentStreme: { id: null, name: 'Select Streme...', links: [] },
        stremeLinks: [],
        linkTags: { }
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
          alert('Invalid key for state.get: ' + JSON.stringify(key));
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
          alert('Invalid key for state.set: ' + JSON.stringify(key));
          return false;
        }

        if (angular.toType(key) === 'array') {
          setNestedValue(key, data);
        } else {
          stateHash[key] = data;
        }

        var eventName = getKeyName(key) + '.update';
        alert(eventName);
        $rootScope.$broadcast(eventName, data);
      };

      return {
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
        }
      };
    })();

    var register = function(scope, eventName, callback) {
      scope.$on(eventName, function(event, data) {
        callback(event, data);
      });
    };


    // TODO: This should only update the streme with streme_id
    var updateStremeLinks = function(streme_id) {
      alert('Shared: Update Streme Links');
      return Data.findLinksByStremeId(streme_id).
        then(function(foundLinks) {
          if(foundLinks) {
            state.set(['currentStreme','links'], foundLinks);
            return state.save('currentStreme');
          }
        }, function(message) { alert(message); });
    };

    var updateLinkTags = function(link_id) {
      alert('Shared: Update Link Tags');
      return Data.findTagsByLinkId(link_id).
        then(function(foundTags) {
          alert('Tags for ' + link_id + ' : ' + JSON.stringify(foundTags));
          if(foundTags.length > 0) {
            angular.forEach(state.get(['currentStreme','links']), function(link, index) {
              if(link.id === link_id) {
                state.set(['currentStreme', 'links', index, 'tags'], foundTags);
                return state.save('currentStreme');
              }
            });
          }
        });
    };

    // Register callback to update links when currentStreme updated.
    register($rootScope, 'currentStreme.update', function(event, streme) {
      if(streme.id) { updateStremeLinks(streme.id); }
    });

    register($rootScope, 'currentStreme.links.update', function(event, links) {
      angular.forEach(state.get(['currentStreme', 'links']), function(link) {
        if(link.id) { updateLinkTags(link.id); }
      });
    });

    state.loadSaved('currentStreme');

    return {
      currentStreme: state.currentStreme,

      get: state.get,
      set: state.set,

      register: register,

      updateStremeLinks: function() {
        var streme_id = state.get('currentStreme').id;
        return updateStremeLinks(streme_id)
      },

      updateLinkTags: updateLinkTags

    };
  }
})();
