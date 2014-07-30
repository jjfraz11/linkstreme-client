'use strict';

(function(){
  angular.module('LS.controllers').
    controller('CollectCtrl',
               [ '$scope', 'Data', 'Shared',
                 'Sessions', 'Tabs', CollectCtrl ]);

  function CollectCtrl($scope, Data, Shared, Sessions, Tabs){
    var currentStreme;
    var stremeLinks;

    $scope.name = 'CollectCtrl';

    var setLinkString = function() {
      $scope.linkString = JSON.stringify(stremeLinks);
      // alert("LinkString: " + $scope.linkString);
    };

    // Set current tab
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

    // Event Handlers
    Shared.register($scope, 'currentStreme.update', function(event, streme) {
      currentStreme = streme;
    });
    Shared.register($scope, 'stremeLinks.update', function(event, links) {
      stremeLinks = links;
      setLinkString();
      setActiveTabs();
    });


    // Scope methods
    $scope.closeTab = function(tab_id, $event) {
      // Disable click event for close tab element
      $event.stopPropagation();
      Tabs.remove(tab_id).
        then(function(tab_id) { setActiveTabs(); });
    }


    // UI Controls
    $scope.saveLinks = function() {
      // TODO: need to add check for at least one selected tab.
      angular.forEach($scope.activeTabs, function(tab) {
        if(tab.selected) {
          console.log('Selected: ' + tab.title);

          Data.saveLink(currentStreme, tab.url).
            then(function(link) {
              Shared.updateStremeLinks();
            }, function(message) { alert(message); });
        }
      });
    }

    $scope.toggleTab = function(tab, $event) {
      // Disable click event for checkbox element
      $event.stopPropagation();
      tab.selected = !tab.selected;
    }

    // Todo: prevent user from opening tabs closed before popup opened
    // Todo: prevent reopened tab from gaining focus and closing popup
    $scope.undoCloseTab = function() {
      Sessions.restoreLastTab();
      setActiveTabs();
    };

    $scope.resetDatabase = function() {
      Data.resetDatabase();
    };

    // TODO move these methods into an init function
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
