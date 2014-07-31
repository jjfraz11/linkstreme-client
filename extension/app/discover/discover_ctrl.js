'use strict';

(function(){
  angular.module('LS.controllers').
    controller('DiscoverCtrl', [ '$scope', 'Data', 'Shared', DiscoverCtrl ]);

  function DiscoverCtrl($scope, Data, Shared){
    $scope.name = 'DiscoverCtrl'

    $scope.removeLink = function(link_id) {
      Data.removeLink(link_id).
        then(function(retVal) {
          alert(JSON.stringify(retVal));
          Shared.updateStremeLinks();
        }, function(message) { alert(message); });
    };

    Shared.register($scope, 'stremeLinks.update', function(event, links) {
      $scope.stremeLinks = links;
    });

    Shared.load('stremeLinks', function(links) {
      $scope.stremeLinks = links;
    });
  }
})();
