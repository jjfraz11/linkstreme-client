 'use strict';

(function(){
  angular.module("LS.chrome").
    factory('Tabs', [ '$q', 'Uri', ChromeTabs ]);

  function ChromeTabs($q, Uri) {
    // Return standard tab object
    var newTab = function(tabData) {
      return {
        tab_id:   tabData.id,
        index:    tabData.index + 1,
        title:    tabData.title,
        url:      Uri.normalize(tabData.url),
        tags:     [],

        active:   tabData.highlighted,
        changed:  false,
        saved:    false,
        selected: false
      };
    }

    return {
      active: function() {
        var queryParams = {
          'lastFocusedWindow': true
        };
        var deferred = $q.defer();
        var activeTabs = [];

        chrome.tabs.query(queryParams, function(tabs){
          if(tabs) {
            angular.forEach(tabs, function(tabData) {
              activeTabs.push(newTab(tabData));
            });
            deferred.resolve(activeTabs);
          } else {
            deferred.reject('Tabs ' + tabs + ' is not valid.');
          }
        });

        return deferred.promise;
      },

      current: function() {
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
            deferred.reject('Tab ' + tab + ' is not valid.');
          }
        });

        return deferred.promise;
      },

      remove: function(tab_id) {
        var deferred = $q.defer();

        chrome.tabs.remove(tab_id, function() {
          deferred.resolve(tab_id);
        });

        return deferred.promise;
      },

      update: function(tab_id, options) {
        chrome.tabs.update(tab_id, options);
      }
    };
  }
})();
