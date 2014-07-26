'use strict';

angular.module('LS.discover', []).
  controller('DiscoverCtrl', [ '$scope', 'Shared', DiscoverCtrl ]);

function DiscoverCtrl($scope, Shared){
  $scope.url = 'Discover: http://google.com';

  Shared.register($scope, 'stremeLinks.update', function(event, links) {
    $scope.stremeLinks = links;
  });
}
