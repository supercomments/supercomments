'use strict';

var Fluxxor = require('fluxxor');
var Constants = require('../constants/constants');
var Snoocore = require('snoocore');

const USER_AGENT = 'SuperComments';
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

function getBestPost(url) {
  return reddit('search.json').get({ q: 'url:' + url }).then((listing) => {
    var sortedPosts = listing.data.children.sort((a, b) => {
      // Descending order
      return b.data.score - a.data.score;
    });
    return sortedPosts.length > 0 ? sortedPosts[0].data : null;
  });
}

function getCommentsFromListing(listing) {
  if (!listing) {
    return null;
  }
    return listing.data.children.filter((comment) => {
    return comment.kind === 't1'; 
  }).map((comment) => {
    comment.data.replies = getCommentsFromListing(comment.data.replies);
    return comment.data;
  });
}

var RedditStore = Fluxxor.createStore({
  initialize: function() {
    this.state = { sortBy: 'best' };
    this.restoreSession();
    this.bindActions(
      Constants.UPDATE_URL, this.onUpdateUrl,
      Constants.LOGIN, this.onLogin,
      Constants.LOGOUT, this.onLogout,
      Constants.SUBMIT_COMMENT, this.onSubmitComment,
      Constants.VOTE, this.onVote,
      Constants.EDIT_COMMENT, this.onEditComment,
      Constants.DELETE_COMMENT, this.onDeleteComment,
      Constants.REPORT_COMMENT, this.onReportComment,
      Constants.SORT_BY_BEST, this.onSortByBest,
      Constants.SORT_BY_NEWEST, this.onSortByNewest,
      Constants.SORT_BY_OLDEST, this.onSortByOldest
    );
    reddit.on('access_token_expired', this.onLogout.bind(this));
  },

  onUpdateUrl: function(url) {
    this.state.url = url;
    getBestPost(this.state.url).then((post) => {
      if (post) {
        this.state.permalink = 'http://www.reddit.com' + post.permalink;
        this.state.subreddit = post.subreddit;
      }
      this.state.post = post;
      this.reloadComments();
    });
  },

  onLogin: function() {
    var state = 'TODO'; // CSRF
    var url = reddit.getImplicitAuthUrl(state);

    window.addEventListener('message', (event) => {
      reddit.auth(event.data).then(() => {
        return reddit('/api/v1/me').get();
      })
      .then((data) =>{
        this.saveSession(event.data, data.name);
        this.state.userName = data.name;
        this.emit('change');
        // Reload comments so we can show liked/disliked status
        this.reloadComments();
      });
    }, false);
    window.open(url, 'RedditAuth', 'height=800,width=1024');
  },

  onLogout: function() {
    // Note: can't revoke access token due to CORS
    // see https://github.com/trevorsenior/snoocore/issues/119
    // So for now let's null out the auth data manually
    reddit._authData = {};
    this.state.userName = null;
    delete localStorage.superComments;
    // Reload comments so we show liked/disliked status
    this.reloadComments();
  },

  onSubmitComment: function(payload) {
    var parent = payload.parent;
    reddit('/api/comment').post({
      text: payload.body,
      thing_id: parent.name
    }).then((result) => {
      if (result.json.data.things && result.json.data.things.length > 0) {
        var comment = result.json.data.things[0].data;
        if (parent.parent_id) {
          // Parent has a parent, so it's a comment
          if (parent.replies) {
            parent.replies.push(comment);
          }
          else {
            parent.replies = [ comment ];
          }
        }
        else {
          this.state.comments.push(comment);
        }
      }
      this.emit('change');
    });
  },

  onVote: function(payload) {
    var thing = payload.thing;
    var previousLikes = thing.likes ? 1 : (thing.likes === false ? -1 : 0);
    reddit('/api/vote').post({
      id: thing.name,
      dir: payload.dir
    }).then(() => {
      thing.likes = payload.dir === 1 ? true : (payload.dir === 0 ? null : false);
      // Would be nice if `api/vote` returned the new score. Oh well.
      thing.score = thing.score - previousLikes + payload.dir;
      this.emit('change');
    });
  },

  onEditComment: function(payload) {
    var comment = payload.comment;
    reddit('/api/editusertext').post({
      thing_id: comment.name,
      text: payload.body
    }).then(() => {
      comment.body = payload.body;
      this.emit('change');
    });
  },

  onDeleteComment: function(comment) {
    reddit('/api/del').post({
      id: comment.name
    }).then(() => {
      comment.author = '[deleted]';
      comment.body = '[deleted]';
      this.emit('change');
    });
  },

  onReportComment: function(comment) {
    // TODO: currently getting a 403 for this, need to investigate
    reddit('/api/report').post({
      thing_id: comment.name,
      reason: 'other',
      other_reason: 'inappropriate (reported via SuperComments)'
    });
  },

  onSortByBest: function() {
    this.changeSortBy('best');
  },

  onSortByNewest: function() {
    this.changeSortBy('new');
  },

  onSortByOldest: function() {
    this.changeSortBy('old');
  },

  changeSortBy: function(order) {
    this.state.sortBy = order;
    this.reloadComments();
  },

  reloadComments: function() {
    if (this.state.post) {
      reddit('comments/' + this.state.post.id + '.json').get({ sort: this.state.sortBy }).then((listings) => {
        this.state.post = listings[0].data.children[0].data;
        this.state.comments = getCommentsFromListing(listings[1]);
        this.emit('change');
      });
    }
  },

  saveSession: function(token, userName) {
    var superComments = localStorage.superComments ? JSON.parse(localStorage.superComments) : {};
    if (!superComments.reddit) {
      superComments.reddit = {};
    }
    superComments.reddit.token = token;
    superComments.reddit.userName = userName;
    superComments.reddit.timestamp = Date.now();
    localStorage.superComments = JSON.stringify(superComments);
  },

  restoreSession: function() {
    if (localStorage.superComments) {
      var superComments = JSON.parse(localStorage.superComments);
      if (superComments.reddit && superComments.reddit.token) {
        if (Date.now() - superComments.reddit.timestamp < AUTH_TIMEOUT_MS) {
          reddit.auth(superComments.reddit.token);
          this.state.userName = superComments.reddit.userName;
        }
      }
    }
  },

  getState: function() {
    return this.state;
  },

  getRedditAPI: function() {
    // For testing purposes
    // Would love to find a better way to do this
    return reddit;
  }
});

module.exports = RedditStore;
