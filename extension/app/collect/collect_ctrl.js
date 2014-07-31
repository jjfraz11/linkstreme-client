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
      alert("Current Streme: " + $scope.currentStreme);
    };

    var setCurrentTab = function() {
      Tabs.current().
        then(function(currentTab) {
          if(currentTab) {
            $scope.currentTab = currentTab;
          }
        }, function(message) { alert(message); });
    };

    // Set active tabs
    var setActiveTabs = function() {
      Tabs.active().
        then(function(activeTabs) {
          $scope.activeTabs = [];
          angular.forEach(activeTabs, function(activeTab) {
            angular.forEach(currentStreme.links, function(link) {
              if(link.url == activeTab.url) {
                activeTab.selected = true;
                activeTab.inCurrent = true;
              }
            });
            $scope.activeTabs.push(activeTab);
          });
        }, function(message) { alert(message); });
    };

    // UI Controls
    $scope.name = 'CollectCtrl';

    $scope.saveLinks = function() {
      if (!currentStreme.id) {
        alert('No streme selected.');
      } else {
        var anySelected;
        angular.forEach($scope.activeTabs, function(tab) {
          if(tab.selected) {
            anySelected = true;
            var linkData = { streme: currentStreme, url: tab.url };

            Data.saveLink(linkData).
              then(function(link) {
              }, function(message) { alert(message); });
          }
        });

        if (!anySelected) {
          alert('No tabs selected.');
        } else {
          Shared.updateStremeLinks();
        }
      }
    }

    // Todo: prevent user from opening tabs closed before popup opened
    // Todo: prevent reopened tab from gaining focus and closing popup
    $scope.undoCloseTab = function() {
      Sessions.restoreLastTab();
      setActiveTabs();
    };

    $scope.toggleTab = function(tab, $event) {
      // Disable click event for checkbox element
      $event.stopPropagation();
      tab.selected = !tab.selected;
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
    // Event Handlers
    Shared.register($scope, 'stremeLinks.update', function(event, links) {
      loadCurrentStreme();
      setActiveTabs();
    });

    loadCurrentStreme()
    setCurrentTab();
    setActiveTabs();
  }
})();
