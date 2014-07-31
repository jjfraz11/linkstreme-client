'use strict';

(function(){
  angular.module('LS.services').
    factory('Shared', [ '$rootScope', 'Data', Shared ]);

  function Shared($rootScope, Data) {
    var state = {
      currentStreme: { id: null, links: [] },
      stremeLinks: []
    };

    var update = function(key, data) {
      var eventName = key + '.update';

      state[key] = data;
      $rootScope.$broadcast(eventName, state[key]);
    };

    var load = function(key, callback) {
      var data = state[key];
      callback(data);
    };

    var register = function($scope, eventName, callback) {
      $scope.$on(eventName, function(event, data) {
        callback(event, data);
      });
    };

    var updateStremeLinks = function(streme_id) {
      return Data.findLinksByStremeId(streme_id).
        then(function(foundLinks) {
          state.currentStreme.links = foundLinks;
          return update('stremeLinks', foundLinks);
        });
    };

    // Register callback to update links when currentStreme updated.
    register($rootScope, 'currentStreme.update', function(event, streme) {
      updateStremeLinks(streme.id);
    });

    return {
      currentStreme: state.currentStreme,

      update: update,

      register: register,
      load: load,

      updateStremeLinks: function(streme_id) {
        updateStremeLinks(state.currentStreme.id || streme_id)
      }

    };
  }
})();
