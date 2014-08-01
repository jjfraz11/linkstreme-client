'use strict';

(function(){
  angular.module('LS.controllers').
    controller('StremeSelectCtrl', [ '$scope', '$modal', 'Shared', StremeSelectCtrl ]);

  function StremeSelectCtrl($scope, $modal, Shared) {
    $scope.name = 'StremeSelectCtrl';

    $scope.open = function(stremeType) {
      var modalInstance = $modal.open({
        templateUrl: 'streme_select/streme_select_modal.html',
        controller: 'StremeSelectModalCtrl',
        resolve: {
          currentStreme: function() { return $scope.currentStreme; },
          stremeType: function () { return stremeType; }
        }
      });

      modalInstance.result.
        then(function(streme) { Shared.update('currentStreme', streme); },
             function() { console.log('No streme selected.'); });
    };

    Shared.register($scope, 'currentStreme.update', function(event, streme) {
      $scope.currentStreme = streme;
    });

    Shared.load('currentStreme', function(currentStreme) {
      $scope.currentStreme = currentStreme;
    });
  }

})();
