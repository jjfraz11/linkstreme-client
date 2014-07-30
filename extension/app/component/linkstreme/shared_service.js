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

      alert('Updated ' + key + ' : ' + JSON.stringify(state[key]));
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

    // Register callback to update links when currentStreme updated.
    register($rootScope, 'currentStreme.update', function(event, streme) {
      Data.Links.findByStremeId(streme.id).
        then(function(foundLinks) {
          update('stremeLinks', foundLinks);
        });
    });

    return {
      update: update,
      state: state,

      register: register,
      load: load
    };
  }
})();
