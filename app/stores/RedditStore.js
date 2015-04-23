'use strict';

var Fluxxor = require('fluxxor');
var Constants = require('../constants/Constants');
var capitalize = require('capitalize');

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

function countComments(comments) {
  if (!comments) {
    return;
  }
  return comments.reduce((current, comment) => {
    var children = comment.replies;
    return current + 1 + (children ? countComments(children) : 0);
  }, 0);
}

var RedditStore = Fluxxor.createStore({
  initialize: function() {
    this.state = {
      sortBy: 'best',
      get userName() {
        return this._userName;
      },
      set userName(value) {
        this._userName = value;
        this.profileUrl = `http://www.reddit.com/user/${this._userName}`;
      }
    };
    this.bindActions(
      Constants.UPDATING_URL, this.onUpdatingUrl,
      Constants.UPDATED_URL, this.onUpdatedUrl,
      Constants.LOGGING_IN, this.onLoggingIn,
      Constants.LOGGED_IN, this.onLoggedIn,
      Constants.LOGOUT, this.onLogout,
      Constants.SUBMITTING_COMMENT, this.onSubmittingComment,
      Constants.SUBMITTED_COMMENT, this.onSubmittedComment,
      Constants.RELOADING_COMMENTS, this.onReloadingComments,
      Constants.RELOADED_COMMENTS, this.onReloadedComments,
      Constants.VOTING, this.onVoting,
      Constants.VOTED, this.onVoted,
      Constants.EDITING_COMMENT, this.onEditingComment,
      Constants.EDITED_COMMENT, this.onEditedComment,
      Constants.DELETING_COMMENT, this.onDeletingComment,
      Constants.DELETED_COMMENT, this.onDeletedComment,
      Constants.REPORTING_COMMENT, this.onReportingComment,
      Constants.REPORTED_COMMENT, this.onReportedComment,
      Constants.SORT_BY_BEST, this.onSortByBest,
      Constants.SORT_BY_NEWEST, this.onSortByNewest,
      Constants.SORT_BY_OLDEST, this.onSortByOldest,
      Constants.SET_TOOLTIP, this.onSetTooltip
    );
  },

  onUpdatingUrl: function(url) {
    this.state.url = url;
    this.state.postLoaded = false;
    this.state.commentsLoaded = false;

    this.emit('change');
  },

  onUpdatedUrl: function(post) {
    if (post) {
      this.state.permalink = 'http://www.reddit.com' + post.permalink;
      this.state.subreddit = `/r/${capitalize(post.subreddit)}`;
      this.state.subredditUrl = `http://www.reddit.com${this.state.subreddit}`;
      this.state.post = post;
    }
    this.state.postLoaded = true;
    this.emit('change');
  },

  onLoggingIn: function() {
    this.state.loggingIn = true;
    this.emit('change');
  },

  onLoggedIn: function(userName) {
    this.state.loggingIn = false;
    this.state.userName = userName;
    this.emit('change');
  },

  onLogout: function() {
    this.state.userName = null;
    this.emit('change');
  },

  onSubmittingComment: function(payload) {
    this.waitFor([ 'ItemStateStore' ], () => {
      var parent = payload.parent;
      var comment ={
        id: payload.id,
        author: this.state.userName,
        body: payload.body,
        likes: true,
        score: 1
      };
      if (parent.parent_id) {
        // Parent has a parent, so it's a comment
        // Add it to the top of the replies
        parent.replies = [ comment ].concat(parent.replies || []);
      }
      else {
        this.state.comments.unshift(comment);
      }
      this.emit('change');
    });
  },

  onSubmittedComment: function(payload) {
    var comment = payload.comment;
    var parent = payload.parent;
    var comments = parent.parent_id ? parent.replies : this.state.comments;
    var index = comments.findIndex((current) => {
      return current.id === payload.id;
    });
    if (index !== -1) {
      comments.splice(index, 1, comment);
      this.emit('change');
    }
  },

  onReloadingComments: function() {
    this.state.commentsLoaded = false;
    this.emit('change');
  },

  onReloadedComments: function(payload) {
    if (payload) {
      this.state.post = payload.post;
      this.state.comments = getCommentsFromListing(payload.comments);
      this.state.commentCount = countComments(this.state.comments);
    }
    this.state.commentsLoaded = true;
    this.emit('change');
  },

  onVoting: function(payload) {
    this.waitFor([ 'ItemStateStore' ], () => {
      var thing = payload.thing;
      var dir = payload.dir;
      // `false` means dislike, `null` means neither like nor dislikes
      var previousLikes = thing.likes ? 1 : (thing.likes === false ? -1 : 0);
      thing.likes = dir === 1 ? true : (dir === 0 ? null : false);
      // Would be nice if `api/vote` returned the new score. Oh well.
      thing.score = thing.score - previousLikes + dir;
      this.emit('change');
    });
  },

  onVoted: function() {
  },

  onEditingComment: function(payload) {
    this.waitFor([ 'ItemStateStore' ], () => {
      var comment = payload.comment;
      comment.body = payload.body;
      this.emit('change');
    });
  },

  onEditedComment: function() {
  },

  onDeletingComment: function(comment) {
    this.waitFor([ 'ItemStateStore' ], () => {
      comment.author = '[deleted]';
      comment.body = '[deleted]';
      this.emit('change');
    });
  },

  onDeletedComment: function() {
  },

  onReportingComment: function(/* comment */) {
  },

  onReportedComment: function(/* comment */) {
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
    if (this.state.sortBy !== order) {
      this.state.sortBy = order;
      this.state.commentsLoaded = false;
      this.emit('change');
    }
  },

  onSetTooltip: function(tooltip) {
    this.state.tooltip = tooltip;
    this.emit('change');
  },

  getState: function() {
    return this.state;
  }
});

module.exports = RedditStore;
