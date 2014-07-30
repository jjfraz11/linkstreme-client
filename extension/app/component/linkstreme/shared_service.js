'use strict';

(function(){
  angular.module('LS.services').
    factory('Shared', [ '$rootScope', 'LinkStore', 'UriStore', Shared ]);

  function Shared($rootScope, LinkStore, UriStore) {
    var state = {
      currentStreme: { id: null, links: [] },
      stremeLinks: [],
      uris: {}
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
      LinkStore.findByStremeId(streme_id).
        then(function(foundLinks) {
          update('stremeLinks', foundLinks);
        });
    };

    // Register callback to update links when currentStreme updated.
    register($rootScope, 'currentStreme.update', function(event, streme) {
      updateStremeLinks(streme.id);
    });

    return {
      currentStreme: state.currentStreme,
      stremeLinks: state.stremeLinks,

      update: update,

      register: register,
      load: load,

      updateStremeLinks: function() {
        updateStremeLinks(state.currentStreme.id)
      }

    };
  }
})();
