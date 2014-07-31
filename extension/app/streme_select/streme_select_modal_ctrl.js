'use strict';

(function(){
  angular.module('LS.controllers').
    controller('StremeSelectModalCtrl',
               [ '$scope', '$modalInstance', 'Data', 'currentStreme', 'stremeType',
                 StremeSelectModalCtrl ]);

  function StremeSelectModalCtrl($scope, $modalInstance, Data, currentStreme, stremeType) {
    // TODO: Fix streme selection to work in different contexts
    $scope.selected = currentStreme;

    var selectTab = function(stremeType) {
      if ( stremeType == 'linkstreme' ) {
        $scope.linkstreme.active = true;
      } else if ( stremeType == 'bookmarks' ) {
        $scope.bookmarks.active = true;
      } else if ( stremeType == 'history' ) {
        $scope.history.active = true;
      } else {
        alert('Unknown stremeType: ' + stremeType);
      }
    }

    $scope.stremeType = stremeType;

    $scope.linkstreme = {
      active: false,
      heading: "Linkstreme",
      currentStreme: { name: 'Select...' },
      showNew: false,
      stremes: [],

      add: function(stremeData) {
        Data.saveStreme(stremeData).
          then(function(streme_id) {
            stremeData.id = streme_id;
            $scope.linkstreme.select(stremeData);
            $scope.linkstreme.showNew = false;
            $scope.linkstreme.updateStremes();
          }, function(message) {
            alert(message);
          });
      },

      create: function() {
        $scope.newStreme = { links: [] };
        $scope.linkstreme.showNew = true;
      },

      select: function(streme) {
        // TODO: Eventually selected should be handled based on
        // the selected tab when the OK button is clicked
        $scope.linkstreme.currentStreme = streme;
        $scope.selected = $scope.linkstreme.currentStreme;
      },

      updateStremes: function() {
        Data.loadStremes().
          then(function(stremes) {
            $scope.linkstreme.stremes = stremes;
          }, function(error) {
            alert(error);
          });
      }
    };

    $scope.bookmarks = {
      active: false,
      heading: "Bookmarks"
    };

    $scope.history = {
      active: false,
      heading: "History"
    };

    $scope.ok = function() {
      $modalInstance.close($scope.selected);
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('canceled result');
    };

    // Init code
    selectTab(stremeType);
    $scope.linkstreme.updateStremes();
  }

})();
