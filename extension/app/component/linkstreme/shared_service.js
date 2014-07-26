'use strict';

angular.module('LS.Shared', [ 'LS.Data' ]).
  factory('Shared', [ '$rootScope', 'LinkStreme', Shared ]);

function Shared($rootScope, LinkStreme) {
  var state = {};

  var update = function(key, data) {
    var eventName = key + '.update';

    state[key] = data;
    $rootScope.$broadcast(eventName, state[key]);

    alert('Updated ' + key + ' : ' + JSON.stringify(state[key]));
  };

  var register = function($scope, eventName, callback) {
    $scope.$on(eventName, function(event, data) {
      callback(event, data);
    });
  };

  // Register callback to update links when currentStreme updated.
  register($rootScope, 'currentStreme.update', function(event, streme) {
    LinkStreme.getStremeLinks(streme).
      then(function(foundLinks) {
        update('stremeLinks', foundLinks);
      });
  });

  return {
    update: update,
    state: state,
    register: register
  };
}
