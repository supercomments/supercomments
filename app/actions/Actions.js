var Constants = require('../constants/Constants');
var Snoocore = require('snoocore');
var shortid = require('shortid');

const USER_AGENT = 'SuperComments';
const AUTH_WINDOW_WIDTH = 1024;
const AUTH_WINDOW_HEIGHT = 800;
const AUTH_TIMEOUT_MS = 3600*1000;

function createAPI() {
  return new Snoocore({
    userAgent: USER_AGENT,
    oauth: { 
      type: 'implicit',
      duration: 'permanent',
      consumerKey: 'dtW9TLAGpuiLsw',
      redirectUri: 'http://127.0.0.1:3000/html/redditAuth.html',
      scope: [ 'identity', 'read', 'submit', 'vote', 'edit', 'report' ]
    }
  });
}

var reddit = createAPI();

var messageListenerAdded = false;

function getBestPost(url) {
  return reddit('search.json').get({ q: 'url:' + url }).then((listing) => {
    var sortedPosts = listing.data.children.sort((a, b) => {
      // Descending order
      return b.data.score - a.data.score;
    });
    return sortedPosts.length > 0 ? sortedPosts[0].data : null;
  });
}

function saveSession(token, userName) {
  var superComments = localStorage.superComments ? JSON.parse(localStorage.superComments) : {};
  if (!superComments.reddit) {
    superComments.reddit = {};
  }
  superComments.reddit.token = token;
  superComments.reddit.userName = userName;
  superComments.reddit.timestamp = Date.now();
  localStorage.superComments = JSON.stringify(superComments);
}

function restoreSession() {
  if (localStorage.superComments) {
    var superComments = JSON.parse(localStorage.superComments);
    if (superComments.reddit && superComments.reddit.token) {
      if (Date.now() - superComments.reddit.timestamp < AUTH_TIMEOUT_MS) {
        reddit.auth(superComments.reddit.token);
        return superComments.reddit.userName;
      }
    }
  }
  // Null signals that no session was restored
  return null;
}

var Actions = {
  updateUrl: function(url) {
    var userName = restoreSession();
    if (userName) {
      this.dispatch(Constants.LOGGED_IN, userName);
    }
    this.dispatch(Constants.UPDATING_URL, url);
    getBestPost(url).then((post) => {
      this.dispatch(Constants.UPDATED_URL, post);
      this.flux.actions.reloadComments({ post: post, sortBy: 'best' });
    });
  },

  login: function() {
    var state = 'TODO'; // CSRF
    var url = reddit.getImplicitAuthUrl(state);

    if (!messageListenerAdded) {
      // Used so the OAuth popup can tell us when the user has authenticated
      window.addEventListener('message', (event) => {
        this.dispatch(Constants.LOGGING_IN);
        reddit.auth(event.data).then(() => {
          return reddit('/api/v1/me').get();
        })
        .then((data) => {
          var token = event.data;
          var userName = data.name;
          this.dispatch(Constants.LOGGED_IN, userName);
          saveSession(token, userName);

          var store = this.flux.store('RedditStore');
          this.flux.actions.reloadComments({ post: store.getState().post, sortBy: store.getState().sortBy });
        });
      }, false);
      messageListenerAdded = true;
    }

    window.open(url, 'RedditAuth', `height=${AUTH_WINDOW_HEIGHT},width=${AUTH_WINDOW_WIDTH}`);
  },

  logout: function() {
    reddit._authData = {};
    delete localStorage.superComments;
    this.dispatch(Constants.LOGOUT);
    var store = this.flux.store('RedditStore');
    this.flux.actions.reloadComments({ post: store.getState().post, sortBy: store.getState().sortBy });
  },

  submitComment: function(payload) {
    var tempId = shortid.generate();
    this.dispatch(Constants.SUBMITTING_COMMENT, Object.assign({ id: tempId }, payload));
    reddit('/api/comment').post({
      text: payload.body,
      thing_id: payload.parent.name
    }).then((result) => {
      if (result.json.data.things && result.json.data.things.length > 0) {
        var comment = result.json.data.things[0].data;
        this.dispatch(Constants.SUBMITTED_COMMENT, { id: tempId, parent: payload.parent, comment: comment });
      }
    });
  },

  vote: function(payload) {
    var thing = payload.thing;
    this.dispatch(Constants.VOTING, payload);
    reddit('/api/vote').post({
      id: thing.name,
      dir: payload.dir
    }).then(() => {
      this.dispatch(Constants.VOTED, thing);
    });
  },

  reloadComments: function(payload) {
    this.dispatch(Constants.RELOADING_COMMENTS);
    if (payload.post) {
      reddit('comments/' + payload.post.id + '.json').get({ sort: payload.sortBy }).then((listings) => {
        this.dispatch(Constants.RELOADED_COMMENTS, { post: listings[0].data.children[0].data, comments: listings[1] });
      });
    }
    else {
      this.dispatch(Constants.RELOADED_COMMENTS, null);
    }
  },

  sortByBest: function() {
    this.dispatch(Constants.SORT_BY_BEST);
    var store = this.flux.store('RedditStore');
    this.flux.actions.reloadComments({ post: store.getState().post, sortBy: store.getState().sortBy });
  },

  sortByNewest: function() {
    this.dispatch(Constants.SORT_BY_NEWEST);
    var store = this.flux.store('RedditStore');
    this.flux.actions.reloadComments({ post: store.getState().post, sortBy: store.getState().sortBy });
  },

  sortByOldest: function() {
    this.dispatch(Constants.SORT_BY_OLDEST);
    var store = this.flux.store('RedditStore');
    this.flux.actions.reloadComments({ post: store.getState().post, sortBy: store.getState().sortBy });
  },

  editComment: function(payload) {
    var comment = payload.comment;
    this.dispatch(Constants.EDITING_COMMENT, payload);
    reddit('/api/editusertext').post({
      thing_id: comment.name,
      text: payload.body
    }).then(() => {
      this.dispatch(Constants.EDITED_COMMENT, comment);
    });
  },

  deleteComment: function(comment) {
    this.dispatch(Constants.DELETING_COMMENT, comment);
    reddit('/api/del').post({
      id: comment.name
    }).then(() => {
      this.dispatch(Constants.DELETED_COMMENT, comment);
    });
  },

  reportComment: function(comment) {
    this.dispatch(Constants.REPORTING_COMMENT, comment);
    // TODO: currently getting a 403 for this, need to investigate
    reddit('/api/report').post({
      thing_id: comment.name,
      reason: 'other',
      other_reason: 'inappropriate (reported via SuperComments)'
    }).then(() => {
      this.dispatch(Constants.REPORTED_COMMENT, comment);
    });
  },

  itemChanged: function(payload) {
    this.dispatch(Constants.ITEM_CHANGED, payload);
  },

  itemRemoved: function(item) {
    this.dispatch(Constants.ITEM_REMOVED, item);
  },

  setTooltip: function(tooltip) {
    this.dispatch(Constants.SET_TOOLTIP, tooltip);
  }
};

reddit.on('access_token_expired', Actions.logout);

module.exports = Actions;