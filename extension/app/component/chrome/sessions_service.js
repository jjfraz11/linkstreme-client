'use strict';

// TODO: Extract dependency on chrome api and use DI
angular.module('LS.chrome', []).
  factory('Sessions2', [ ChromeSessions2 ]);

function ChromeSessions2() {
  return {
    restore: function(restoreCallback) {
      chrome.sessions.restore(restoreCallback);
    },

    restoreLastTab: function() {
      chrome.sessions.restore();
    }
  };
}
