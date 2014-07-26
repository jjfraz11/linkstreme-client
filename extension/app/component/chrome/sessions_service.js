'use strict';

angular.module("Chrome", []).
  factory('Sessions', [ ChromeSessions ]);

function ChromeSessions() {
  return {
    restore: function(restoreCallback) {
      chrome.sessions.restore(restoreCallback);
    },

    restoreLastTab: function() {
      chrome.sessions.restore();
    }
  };
}
