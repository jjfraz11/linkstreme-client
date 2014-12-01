'use strict';

(function(){
    angular.module("LS.chrome").
	factory('Tabs', [ '$q', 'Uri', ChromeTabs ]);

    function ChromeTabs($q, Uri) {
	// Return standard tab object
	var getTabData = function(tab) {
	    return {
		tab_id:   tab.id,
		index:    tab.index + 1,
		title:    tab.title,
		url:      Uri.normalize(tab.url),
		tags:     [],

		active:   tab.highlighted,
		changed:  false,
		saved:    false,
		selected: false
	    };
	};

	function getActiveTabs()  {
            var queryParams = {
		'lastFocusedWindow': true
            };
            var deferred = $q.defer();
            var activeTabs = [];

            chrome.tabs.query(queryParams, function(tabs){
		if(tabs) {
		    angular.forEach(tabs, function(tab) {
			activeTabs.push(getTabData(tab));
		    });
		    deferred.resolve(activeTabs);
		} else {
		    deferred.reject('Tabs ' + JSON.stringify(tabs) + ' is not valid.');
		}
            });

            return deferred.promise;
	};

	function getCurrentTab() {
	    var queryParams = {
		'active': true,
		'lastFocusedWindow': true
	    };
	    var deferred = $q.defer();

	    chrome.tabs.query(queryParams, function(tabs){
		var tab = tabs[0];
		if(tab) {
		    console.log(tab.url);
		    deferred.resolve(tab);
		} else {
		    deferred.reject('Tab ' + JSON.stringify(tab) + ' is not valid.');
		}
	    });

	    return deferred.promise;
	};

	function createTab(createOptions) {
	    var deferred = $q.defer();

	    chrome.tabs.create(createOptions, function() {
		deferred.resolve(true);
	    });

	    return deferred.promise;
	};

	function removeTab(tab_id) {
	    var deferred = $q.defer();

	    chrome.tabs.remove(tab_id, function() {
		deferred.resolve(tab_id);
	    });

	    return deferred.promise;
	};

	function updateTab(tab_id, updateOptions) {
	    chrome.tabs.update(tab_id, updateOptions);
	};

	return {
	    active:  getActiveTabs,
	    current: getCurrentTab,

	    create: createTab,
	    remove: removeTab,
	    update: updateTab
	};
    }
})();
