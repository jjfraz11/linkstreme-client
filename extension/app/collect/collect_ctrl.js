'use strict';

(function(){
  angular.module('LS.controllers').
    controller('CollectCtrl',
               [ '$scope', 'Data', 'Shared', 'Sessions', 'Tabs', CollectCtrl ]);

  function CollectCtrl($scope, Data, Shared, Sessions, Tabs){
    var currentStreme;

    var registerLinkTagUpdate = function(link_id) {
      var eventBase = 'linkTags.' + link_id;
      var eventStart = eventBase + '.update';
      var eventEnd = eventBase + '.updated';

      // Clear any previously registered event handler
      $scope.$broadcast(eventEnd);

      alert('Registered: ' + eventStart);
      var deregister = Shared.register($scope, eventStart, function(event, linkTags) {
        setActiveTabs();
        $scope.$broadcast(eventEnd, linkTags);
      });
      $scope.$on(eventEnd, function() {
        alert('Deregistered: ' + eventEnd);
        deregister();
      });
    };

    var registerLinkTagUpdates = function(links) {
      angular.forEach(links, function(link) {
        registerLinkTagUpdate(link.id);
      });
    };

    var loadCurrentStreme = function() {
      Shared.get('currentStreme', function(streme) {
        currentStreme = streme;
      });
      if (currentStreme.links) {
        registerLinkTagUpdates(currentStreme.links);
      }
      $scope.currentStreme = JSON.stringify(currentStreme);
    };

    // Set active tabs
    var setActiveTabs = function() {
      Tabs.active().
        then(function(tabs) {
          $scope.activeTabs = [];
          angular.forEach(tabs, function(tab) {
            if(currentStreme.hasOwnProperty('links')) {
              angular.forEach(currentStreme.links, function(link) {
                if(link.uri_url == tab.url) {
                  tab.link = link;
                  tab.selected = true;
                  tab.saved = true;

                  Shared.get(['linkTags', link.id], function(tags){
                    if (tags) {
                      tab.tags = tags;
                      alert('Tab: ' + JSON.stringify(tab));
                    }
                  });
                }
              });
            }
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
          if(tab.saved) {
            // Delete un-selected tabs if currently saved
            if (!tab.selected) {
              linkIdsToDelete.push(tab.link.id);
            }
          } else {
            // Save selected links not currently saved
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

    // loadCurrentStreme()
    // setActiveTabs();
  }
})();
