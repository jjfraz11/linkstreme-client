'use strict';

(function(){
  angular.module('LS.services').
    factory('Shared', [ 'Data', 'State', Shared ]);

  function Shared(Data, State) {
    // TODO: This should only update the streme with streme_id
    var updateStremeLinks = function(streme_id) {
      console.log('Shared: Update Links for Streme: ' + streme_id);
      return Data.findLinksByStremeId(streme_id).
        then(function(foundLinks) {
          if(foundLinks) {
            State.set(['currentStreme','links'], foundLinks);
            return State.save('currentStreme');
          }
        }, function(message) { alert(message); });
    };

    var updateLinkTags = function(link_id) {
      console.log('Shared: Update Tags for Link: ' + link_id);
      return Data.findTagsByLinkId(link_id).
        then(function(foundTags) {
          alert('Tags for ' + link_id + ' : ' + JSON.stringify(foundTags));
          if(foundTags.length > 0) {
            angular.forEach(State.get(['currentStreme','links']), function(link, index) {
              if(link.id === link_id) {
                State.set(['linkTags', link_id], foundTags);
              }
            });
          }
        });
    };

    State.init({
      currentStreme: { id: null, name: 'Select Streme...', links: [] },
      stremeLinks: [],
      linkTags: { }
    });

    // Register callback to update links when currentStreme updated.
    State.register(null, 'currentStreme.update', function(event, streme) {
      if(streme.id) { updateStremeLinks(streme.id); }
    });

    State.register(null, 'currentStreme.links.update', function(event, links) {
      angular.forEach(State.get(['currentStreme', 'links']), function(link) {
        if(link.id) { updateLinkTags(link.id); }
      });
    });

    State.loadSaved('currentStreme');

    return {
      currentStreme: State.currentStreme,

      get: State.get,
      set: State.set,
      register: State.register,

      updateStremeLinks: function() {
        var streme_id = State.get('currentStreme').id;
        return updateStremeLinks(streme_id)
      },

      updateLinkTags: updateLinkTags

    };
  }
})();
