 'use strict';

angular.module("Chrome", []).
  factory('Tabs', [ '$q', ChromeTabs ]);

function ChromeTabs($q) {
  return {
    active: function() {
      var queryParams = {
        'lastFocusedWindow': true
      };
      var deferred = $q.defer();

      chrome.tabs.query(queryParams, function(tabs){
        if(tabs) {
          deferred.resolve(tabs);
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
        deferred.resolve(true);
      });

      return deferred.promise;
    },

    update: function(tab_id, options) {
      chrome.tabs.update(tab_id, options);
    }
  };
}
