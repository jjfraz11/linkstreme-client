'use strict';

(function(){
    angular.debug = false;

    // Setup Dependencies for Linkstreme Modules. This file must be required first.
    angular.module('LS.utilities', []);
    angular.module('LS.chrome', [ 'LS.utilities' ]);
    angular.module('LS.models', [ 'LS.utilities' ]);
    angular.module('LS.services', [ 'LS.models', 'LS.utilities' ]);
    angular.module('LS.controllers', [ 'LS.chrome', 'LS.services' ]);

    angular.module('popupApp', [
	'ngRoute', 'ui.bootstrap',
	'LS.controllers', 'LS.services'
    ]).config(['$routeProvider', function($routeProvider) {
	$routeProvider.
	    when('/collect', {
		templateUrl: 'collect/collect.html',
		controller: 'CollectCtrl'
	    }).
	    when('/discover', {
		templateUrl: 'discover/discover.html',
		controller: 'DiscoverCtrl'
	    }).
	    when('/share', {
		templateUrl: 'share/share.html',
		controller: 'ShareCtrl'
	    }).
	    otherwise({
		redirectTo: '/collect'
	    });
    }]);

    angular.toType = function(obj) {
	return ({}).toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
    };
})();
