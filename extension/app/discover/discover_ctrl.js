'use strict';

(function(){
  angular.module('LS.controllers').
    controller('DiscoverCtrl', [ '$scope', 'Data', 'Shared', DiscoverCtrl ]);

  function DiscoverCtrl($scope, Data, Shared){
    var loadCurrentStreme = function() {
      Shared.load('currentStreme', function(currentStreme) {
        $scope.currentStreme = currentStreme;
      });
    };

    $scope.name = 'DiscoverCtrl'

    $scope.removeLink = function(link_id) {
      Data.removeLink(link_id).
        then(function() {
          Shared.updateStremeLinks();
        }, function(message) { alert(message); });
    };

    Shared.register($scope, 'stremeLinks.update', function(event, links) {
      loadCurrentStreme();
    });

    loadCurrentStreme();
  }
})();
