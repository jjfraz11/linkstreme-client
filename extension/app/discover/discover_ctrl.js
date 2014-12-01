'use strict';

(function(){
    angular.module('LS.controllers').
	controller('DiscoverCtrl', [ '$scope', 'Data', 'Shared', 'Tabs', DiscoverCtrl ]);

    function DiscoverCtrl($scope, Data, Shared, Tabs){
	var loadCurrentStreme = function() {
	    Shared.get('currentStreme', function(currentStreme) {
		$scope.currentStreme = currentStreme;
	    });
	};

	$scope.name = 'DiscoverCtrl';

	$scope.openTab = function(linkUrl) {
	    var tabOptions = {
		active: false,
		index:  0,
		url:    linkUrl
	    };

	    Tabs.create(tabOptions);
	};

	$scope.removeLink = function(link_id) {
	    Data.removeLink(link_id).
		then(function() {
		    Shared.updateStremeLinks();
		}, function(message) { alert(message); });
	};

	Shared.register($scope, 'currentStreme.links.update', function(event, links) {
	    loadCurrentStreme();
	});

	loadCurrentStreme();
    }
})();
