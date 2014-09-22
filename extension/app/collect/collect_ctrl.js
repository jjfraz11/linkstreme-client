'use strict';

(function(){
  angular.module('LS.controllers').
    controller('CollectCtrl',
               [ '$scope', 'Data', 'Shared', 'Sessions', 'Tabs', CollectCtrl ]);

  function CollectCtrl($scope, Data, Shared, Sessions, Tabs){
    var loadCurrentStreme = function() {
      Shared.get('currentStreme', function(streme) {
	$scope.currentStreme = streme;
      });
    };

    // Set active tabs
    var setActiveTabs = function() {
      var checkStremeLinks = $scope.currentStreme.hasOwnProperty('links');
      $scope.activeTabs    = [];

      var setupTab = function(tab, link) {
	if( tab.url == link.uri_url ) {
	  // TODO: Are both of these needed?
          tab.saved    = true;
          tab.selected = true;
          tab.link     = link;
	}
      };

      Tabs.active().then(function(tabs) {
	angular.forEach(tabs, function(tab) {
	  if(checkStremeLinks) {
	    angular.forEach($scope.currentStreme.links, function(link) {
	      if (!tab.link) { setupTab(tab, link); }
	    });
	  }
	  $scope.activeTabs.push(tab);
	});
      }, function(message) { alert(message); });
    };




    // UI Controls
    $scope.name = 'CollectCtrl';

    $scope.updateStreme = function() {
      if (!$scope.currentStreme.id) {
        alert('No streme selected.');
      } else {
        var linkDataToSave = [];
        var linkIdsToDelete = [];

        angular.forEach($scope.activeTabs, function(tab) {
          if(tab.saved) {
            // Delete un-selected tabs if currently saved
            if (!tab.selected) {
              linkIdsToDelete.push(tab.link.id);
            }
          } else {
            // Save selected links not currently saved
            if(tab.selected) {
              var linkData = { streme: $scope.currentStreme, url: tab.url };
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

    $scope.addTag = function(tab) {
      if (!tab.link.id) {
        alert('This tab is not saved in a streme.');
      }

      var entityTagData = {
        tag: {
          name: tab.new_tag_name,
        },
        entity: {
          id: tab.link.id,
          type: 'link'
        }
      };
      Data.saveEntityTag(entityTagData).
        then(function(entityTag) {
          // registerLinkTagUpdate(entityTag.entity_id);
          return Shared.updateLinkTags(entityTag.entity_id).
            then(function() {
	      alert('added tag');
              setActiveTabs();
            });
        }, function(message) { alert(message); });
    };

    // TODO: Need to update this functionality
    $scope.resetDatabase = function() {
      // Data.resetDatabase();
    };

    // Initialize collect controller
    Shared.register($scope, 'currentStreme.links.update', function(event, links) {
      loadCurrentStreme();
      setActiveTabs();
    });
  }
})();
