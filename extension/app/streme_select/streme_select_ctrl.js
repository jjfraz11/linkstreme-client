'use strict';

angular.module('LS.stremeSelect', []).
  controller('StremeSelectCtrl',
             [ '$scope', '$modal', 'Shared', StremeSelectCtrl ]);

function StremeSelectCtrl($scope, $modal, Shared) {
  $scope.currentStreme = { name: 'Select Streme...' };
  $scope.name = 'StremeSelectCtrl';

  // Event Handlers
  Shared.register($scope, 'currentStreme.update', function(event, streme) {
    $scope.currentStreme = streme;
  });

  $scope.open = function(stremeType) {
    var modalInstance = $modal.open({
      templateUrl: 'streme_select_modal.html',
      controller: StremeSelectModalCtrl,
      resolve: {
        currentStreme: function() { return $scope.currentStreme; },
        stremeType: function () { return stremeType; }
      }
    });

    modalInstance.result.
      then(function(streme) { Shared.update('currentStreme', streme); },
           function() { console.log('No streme selected.'); });
  }
}

function StremeSelectModalCtrl($scope, $modalInstance, LinkStreme,
                               currentStreme, stremeType) {
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

    add: function(streme) {
      LinkStreme.createStreme(streme).
        then(function(streme_id) {
          $scope.linkstreme.showNew = false;
          $scope.linkstreme.updateStremes();
          $scope.linkstreme.select(streme);
        }, function(message) {
          alert(message);
        });
    },

    create: function() {
      $scope.linkstreme.showNew = true;
      $scope.newStreme = { links: [] };
    },

    select: function(streme) {
      // TODO: Eventually selected should be handled based on
      // the selected tab when the OK button is clicked
      $scope.linkstreme.currentStreme = streme;
      $scope.selected = $scope.linkstreme.currentStreme;
    },

    updateStremes: function() {
      LinkStreme.getAllStremes().
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
