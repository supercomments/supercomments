var Fluxxor = require('fluxxor');
var Constants = require('../constants/Constants');

var DisqusStore = Fluxxor.createStore({
  initialize: function() {
    this.state = {
    };
    this.bindActions(
      Constants.UPDATING_URL, this.onUpdatingUrl,
      Constants.UPDATED_URL, this.onUpdatedUrl
    );
  },

  onUpdatingUrl: function(payload) {
    this.state.url = payload.url;
    this.state.forum = payload.config.disqus.forum;
    this.state.identifier = payload.config.disqus.identifier;
    this.emit('change');
  },

  onUpdatedUrl: function(payload) {
    if ('disqus' in payload) {
      var details = payload.disqus;
      this.state.commentCount = details.posts;
      this.emit('change');
    }
  },

  getState: function() {
    return this.state;
  }
});

module.exports = DisqusStore;
