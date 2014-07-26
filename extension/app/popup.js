'use strict';

(function(){
    // Setup Dependencies for Linkstreme Modules. This file must be required first.
  angular.module('LS.chrome', []);
  angular.module('LS.utilities', []);
  angular.module('LS.services', [ 'LS.utilities' ]);
  angular.module('LS.controllers', [ 'LS.chrome', 'LS.services' ]);

  angular.module('popupApp', ['ui.bootstrap', 'LS.chrome', 'LS.controllers',
                              'LS.utilities', 'LS.services' ]);
})();
