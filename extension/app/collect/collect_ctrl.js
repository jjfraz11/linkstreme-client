'use strict';

(function(){
  angular.module('LS.controllers').
    controller('CollectCtrl',
               [ '$scope', 'Data', 'Shared',
                 'Sessions', 'Tabs', CollectCtrl ]);

  function CollectCtrl($scope, Data, Shared, Sessions, Tabs){
    var currentStreme;

    var loadCurrentStreme = function() {
      Shared.load('currentStreme', function(streme) {
        currentStreme = streme;
      });
      $scope.currentStreme = JSON.stringify(currentStreme);
    };

    // Set active tabs
    var setActiveTabs = function() {
      Tabs.active().
        then(function(tabs) {
          $scope.activeTabs = [];
          angular.forEach(tabs, function(tab) {
            angular.forEach(currentStreme.links, function(link) {
              if(link.url == tab.url) {
                tab.link = link;
                tab.selected = true;
                tab.inCurrent = true;
              }
            });
            $scope.activeTabs.push(tab);
          });
        }, function(message) { alert(message); });
    };

    // UI Controls
    $scope.name = 'CollectCtrl';

    $scope.saveStreme = function() {
      if (!currentStreme.id) {
        alert('No streme selected.');
      } else {
        var linkDataToSave = [];
        var linkIdsToDelete = [];

        angular.forEach($scope.activeTabs, function(tab) {
          if(tab.inCurrent) {
            // Delete un-selected tabs in current
            if (!tab.selected) {
              linkIdsToDelete.push(tab.link.id);
            }
          } else {
            // Save selected links not in current
            if(tab.selected) {
              var linkData = { streme: currentStreme, url: tab.url };
              linkDataToSave.push(linkData);
            }
          }
        });

        Data.updateStreme(linkDataToSave, linkIdsToDelete).
          then(function(result) {
            Shared.updateStremeLinks();
          }, function(message) { alert(message); });
      }
    };

    // Todo: disable undo close tab for tabs not closed by popup
    // Todo: prevent reopened tab from gaining focus and closing popup
    $scope.undoCloseTab = function() {
      Sessions.restoreLastTab();
      setActiveTabs();
    };

    $scope.toggleTab = function(tab, $event) {
      // Disable click event for checkbox element
      $event.stopPropagation();
      tab.selected = !tab.selected;
      tab.changed = !tab.changed;
    }

    $scope.closeTab = function(tab_id, $event) {
      // Disable click event for close tab element
      $event.stopPropagation();
      Tabs.remove(tab_id).
        then(function(tab_id) { setActiveTabs(); });
    }

    $scope.resetDatabase = function() {
      Data.resetDatabase();
    };

    // Initialize collect controller
    Shared.register($scope, 'stremeLinks.update', function(event, links) {
      loadCurrentStreme();
      setActiveTabs();
    });

    loadCurrentStreme()
    setActiveTabs();
  }
})();
