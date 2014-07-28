'use strict';

(function(){
  // TODO: Extract dependency on chrome api and use DI
  angular.module('LS.chrome').
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
})();
