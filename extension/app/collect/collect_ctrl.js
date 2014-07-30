'use strict';

(function(){
  angular.module('LS.controllers').
    controller('CollectCtrl',
               [ '$scope', 'Data', 'Shared',
                 'Sessions', 'Tabs', CollectCtrl ]);

  function CollectCtrl($scope, Data, Shared, Sessions, Tabs){
    $scope.name = 'CollectCtrl';

    var setLinkString = function(links) {
      $scope.linkString = JSON.stringify(links || $scope.stremeLinks);
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
      $scope.currentStreme = streme;
    });
    Shared.register($scope, 'stremeLinks.update', function(event, links) {
      $scope.stremeLinks = links;
      setLinkString();
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

          Data.saveLink(Shared.state.currentStreme, tab.url).
            then(function(link) {
              // TODO: Add link_id to links for currentStreme
              // Then update the shared currentStreme
              Shared.state.stremeLinks.push(link);
              alert('Link #' + link.id + ' successfully added.');
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
    }

    // TODO move these methods into an init function
    Shared.load('currentStreme', function(streme) {
      $scope.currentStreme = streme;
    });

    Shared.load('stremeLinks', function(links) {
      $scope.stremeLinks = links;
    });

    setLinkString();
    setCurrentTab();
    setActiveTabs();
  }
})();
