'use strict';

angular.module("Uri", []).
  factory('Uri', [ Uri ]);

// Misc Library Services
function Uri() {
  return {
    normalize: function(url) {
      return URI.normalize(url);
    },

    parse: function(url) {
      var components = URI.parse(url);

      if( components.errors.length === 0 ) {
        delete components.errors
        components.url = URI.normalize(url);

        return components
      } else {
        alert('Errors: ' + components.errors.join(', '));
      }
    }
  };
}
