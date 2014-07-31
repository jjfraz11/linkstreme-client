'use strict';

(function(){
  angular.module('LS.controllers').
    controller('CollectCtrl',
               [ '$scope', 'Data', 'Shared',
                 'Sessions', 'Tabs', CollectCtrl ]);

  function CollectCtrl($scope, Data, Shared, Sessions, Tabs){
    var currentStreme;
    var stremeLinks;

    var setLinkString = function() {
      $scope.linkString = JSON.stringify(stremeLinks);
      // alert("LinkString: " + $scope.linkString);
    };

    var setCurrentTab = function() {
      Tabs.current().
        then(function(currentTab) {
          if(currentTab) {
            $scope.currentTab = currentTab;
          }
        }, function(message) { alert(message); });
    }

    // Set active tabs
    var setActiveTabs = function() {
      Tabs.active().
        then(function(activeTabs) {
          if(activeTabs) {
            $scope.activeTabs = [];
            angular.forEach(activeTabs, function(tab) {
              $scope.activeTabs.push(Tabs.newTab(tab));
            });
          }
        }, function(message) { alert(message); });
    }

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
                Shared.updateStremeLinks();
              }, function(message) { alert(message); });
          }
        });
        if (!anySelected) { alert('No tabs selected.'); }
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
    Shared.register($scope, 'currentStreme.update', function(event, streme) {
      currentStreme = streme;
    });
    Shared.register($scope, 'stremeLinks.update', function(event, links) {
      stremeLinks = links;
      setLinkString();
      setActiveTabs();
    });

    Shared.load('currentStreme', function(streme) {
      currentStreme = streme;
    });

    Shared.load('stremeLinks', function(links) {
      stremeLinks = links;
    });

    setLinkString();
    setCurrentTab();
    setActiveTabs();
  }
})();
