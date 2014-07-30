'use strict';

(function(){
  angular.module('LS.services').
    factory('Data', [ 'LinkStore', 'StremeStore', 'UriStore', Data ]);

  // Helper Services
  function Data(LinkStore, StremeStore, UriStore) {

    return {
      Links:   LinkStore,
      Stremes: StremeStore,
      Uris:    UriStore,
    };
  }
})();
