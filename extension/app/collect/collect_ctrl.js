'use strict';

(function(){
  angular.module('LS.controllers').
    controller('CollectCtrl',
               [ '$scope', 'Data', 'Shared', 'Sessions', 'Tabs', CollectCtrl ]);

  function CollectCtrl($scope, Data, Shared, Sessions, Tabs){
    // Event Handlers
    $scope.name = 'CollectCtrl';

    $scope.currentStreme = { links: [] };

    Shared.register($scope, 'currentStreme.update', function(event, streme) {
      $scope.currentStreme = streme;
    });

    Shared.register($scope, 'stremeLinks.update', function(event, links) {
      $scope.stremeLinks = links;
      $scope.linkString = JSON.stringify(links);
    });

    // Private methods
    var pFail = function(reason) { alert('Failed: ' + reason); }
    var pNotify = function(update) { alert('Notify: ' + update); }

    // Set current tab
    var setCurrentTab = function() {
      Tabs.current().
        then(function(currentTab) {
          if(currentTab) {
            $scope.currentTab = currentTab;
          }
        }, pFail, pNotify);
    }

    // Set active tabs
    var setActiveTabs = function() {
      // Return standard tab object
      var formatTab = function(tab) {
        return {
          tab_id: tab.id,
          index: tab.index + 1,
          title: tab.title,
          url: tab.url,
          active: tab.highlighted,
          selected: false
        };
      };

      Tabs.active().
        then(function(activeTabs) {
          if(activeTabs) {
            $scope.activeTabs = [];
            angular.forEach(activeTabs, function(tab) {
              $scope.activeTabs.push(formatTab(tab));
            });
          }
        }, pFail, pNotify);
    }

    // Scope methods
    $scope.closeTab = function(tab, $event) {
      // Disable click event for close tab element
      $event.stopPropagation();
      Tabs.remove(tab.tab_id).
        then(function(success) {
          if (success)
            setActiveTabs();
          else
            alert('Tab ' + tab.title + ' not closed.');
        });
    }

    $scope.saveLinks = function() {
      if (!$scope.currentStreme.id) {
        alert('No streme selected.');
        return;
      }

      // This function takes a uri and creates a link in currrentStreme
      // It returns a promise that will look up the link_id.
      var createLink = function(uri) {
        return Data.createLink($scope.currentStreme, uri).
          then(function(link_id) {
            // TODO: Add link_id to links for currentStreme
            // Then update the shared currentStreme
            $scope.currentStreme.links.push(link_id);

            console.log('I should do something with link #' + link_id);
          }, function(message) {
            alert(message);
          });
      };

      // TODO: need to add check for at least one selected tab.
      angular.forEach($scope.activeTabs, function(tab) {
        if(tab.selected) {
          console.log('Selected: ' + tab.title);

          Data.findOrCreateUri(tab.url).
            then(createLink);
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
    // Init code
    setCurrentTab();
    setActiveTabs();
  }
})();
