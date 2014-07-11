(function(){
    angular.module('popupApp', []).
	controller('discoverController', function($scope){
	    $scope.url = 'http://google.com';
	}).
	controller('collectController', [ '$scope', function($scope){
	    $scope.url = 'http://google.com';
	}]).
	controller('shareController', shareController);

    function shareController($scope){
	$scope.url = 'http://google.com';
    }
    shareController.$inject = [ '$scope' ];
})();
