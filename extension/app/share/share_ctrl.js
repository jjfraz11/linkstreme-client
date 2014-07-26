'use strict';

angular.module("LS.share", []).
  controller('ShareCtrl', [ '$scope', ShareCtrl]);

function ShareCtrl($scope){
  $scope.url = 'Share: http://google.com';
}
