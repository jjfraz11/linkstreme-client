'use strict';

angular.module("LS.controllers").
  controller('ShareCtrl', [ '$scope', ShareCtrl]);

function ShareCtrl($scope){
  $scope.url = 'Share: http://google.com';
}
