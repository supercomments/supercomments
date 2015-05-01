var Fluxxor = require('fluxxor');
var Constants = require('../constants/Constants');
var Immutable = require('immutable');
var capitalize = require('capitalize');

function countComments(comments) {
  if (!comments) {
    return;
  }
  return comments.reduce((current, comment) => {
    var children = comment.get('replies');
    return current + 1 + (children ? countComments(children) : 0);
  }, 0);
}

function mapRedditPost(redditPost) {
  return {
    id: redditPost.id,
    name: redditPost.name,
    likes: redditPost.likes,
    score: redditPost.score
  };
}

function mapRedditComment(redditComment) {
  return {
    id: redditComment.id,
    name: redditComment.name,
    author: redditComment.author,
    created_utc: redditComment.created_utc,
    body: redditComment.body,
    likes: redditComment.likes,
    score: redditComment.score,
    replies: getCommentsFromListing(redditComment.replies)
  };
}

function getCommentsFromListing(listing) {
  if (!listing) {
    return Immutable.List();
  }
  return Immutable.List(
    listing.data.children.filter((comment) => {
      return comment.kind === 't1'; 
    }).map((redditComment) => {
      var comment = mapRedditComment(redditComment.data);
      return Immutable.fromJS(comment);
    })
  );
}

function isComment(thing) {
  return thing && thing.get('name').substr(0, 3) === 't1_';
}

var RedditStore = Fluxxor.createStore({
  initialize: function() {
    this.state = {
      sortBy: 'best',
      comments: Immutable.List(),
      postState: {},
      commentState: {},
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
      Constants.SET_TOOLTIP, this.onSetTooltip,
      Constants.ITEM_CHANGED, this.onItemChanged,
      Constants.UNREAD_MESSAGES_READ, this.onUnreadMessagesRead
    );
  },

  onUpdatingUrl: function(payload) {
    this.state.url = payload.url;
    this.state.postLoaded = false;
    this.state.commentsLoaded = false;

    this.emit('change');
  },

  onUpdatedUrl: function(payload) {
    var post = payload.reddit;
    if (post) {
      this.state.permalink = 'http://www.reddit.com' + post.permalink;
      this.state.subreddit = `/r/${capitalize(post.subreddit)}`;
      this.state.subredditUrl = `http://www.reddit.com${this.state.subreddit}`;
      this.state.post = Immutable.fromJS(mapRedditPost(post));
    }
    this.state.postLoaded = true;
    this.emit('change');
  },

  onLoggingIn: function() {
    this.state.loggingIn = true;
    this.emit('change');
  },

  onLoggedIn: function(payload) {
    this.state.loggingIn = false;
    this.state.userName = payload.userName;
    this.state.unreadCount = payload.unreadCount;
    this.emit('change');
  },

  onLogout: function() {
    this.state.userName = null;
    this.emit('change');
  },

  onUnreadMessagesRead: function() {
    this.state.unreadCount = 0;
    this.emit('change');
  },

  onSubmittingComment: function(payload) {
    var parent = payload.parent;
    // Create a temporary comment so we can update the UI while we wait for the real one
    var comment = Immutable.fromJS({
      id: payload.id,
      author: this.state.userName,
      body: payload.body,
      likes: true,
      score: 1,
      disabled: true,
      replies: []
    });
    var newParent;
    if (isComment(parent)) {
      // Remember the new parent since we'll need to update it when the comment is submitted
      newParent = parent.update('replies', (list) => list.unshift(comment));
    }
    else {
      this.state.comments = this.state.comments.unshift(comment);
    }
    this.onItemChanged({ comment: comment, newState: { parent: newParent, disabled: true }});
    this.emit('change');
  },

  onSubmittedComment: function(payload) {
    var parent = this.state.commentState[payload.id].parent;
    delete this.state.commentState[payload.id]; // delete the temporary comment state
    var redditComment = payload.comment;
    var comment = Immutable.fromJS(mapRedditComment(redditComment));
    var mapComments = (value) => {
      if (value.get('id') === payload.id) {
        return comment;
      }
      else {
        return value;
      }
    };
    if (isComment(parent)) {
      parent.update('replies', (list) => list.map(mapComments));
    }
    else {
      this.state.comments = this.state.comments.map(mapComments);
    }
    this.emit('change');
  },

  onReloadingComments: function() {
    this.state.commentsLoaded = false;
    this.emit('change');
  },

  onReloadedComments: function(payload) {
    if (payload) {
      this.state.post = Immutable.fromJS(mapRedditPost(payload.post));
      this.state.comments = getCommentsFromListing(payload.comments);
      this.state.commentCount = countComments(this.state.comments);
    }
    this.state.commentsLoaded = true;
    this.emit('change');
  },

  onVoting: function(payload) {
    var thing = payload.thing;
    this.onItemChanged({ comment: thing, newState: { disabled: true }});
    var dir = payload.dir;
    // `false` means dislike, `null` means neither like nor dislikes
    var previousLikes = thing.get('likes') ? 1 : (thing.get('likes') === false ? -1 : 0);
    thing = thing.update('likes', () => dir === 1 ? true : (dir === 0 ? null : false));
    thing = thing.update('score', score => score - previousLikes + dir);
    // TODO: figure out a better way to handle comments vs. posts without weird hacks
    if (!isComment(thing)) {
      this.state.post = thing;
    }
    this.emit('change');
  },

  onVoted: function(thing) {
    this.onItemChanged({ comment: thing, newState: { disabled: false }});
    this.emit('change');
  },

  onEditingComment: function(payload) {
    var comment = payload.comment;
    this.onItemChanged({ comment: comment, newState: { disabled: true }});
    comment.update('body', () => payload.body);
    this.emit('change');
  },

  onEditedComment: function(comment) {
    this.onItemChanged({ comment: comment, newState: { disabled: false }});
    this.emit('change');
  },

  onDeletingComment: function(comment) {
    this.onItemChanged({ comment: comment, newState: { disabled: true }});
    comment = comment.update('author', () => '[deleted]');
    comment.update('body', () => '[deleted]');
    this.emit('change');
  },

  onDeletedComment: function(comment) {
    this.onItemChanged({ comment: comment, newState: { disabled: false }});
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

  onItemChanged: function(payload) {
    var comment = payload.comment;
    var newState = payload.newState;
    var state = Object.assign(this.getItemState(comment), newState);
    if (comment) {
      this.state.commentState[comment.get('id')] = state;
    }
    else {
      this.postState = state;
    }
    this.emit('change');
  },

  getState: function() {
    return this.state;
  },

  getItemState: function(comment) {
    if (comment) {
      var id = comment.get('id');
      if (id in this.state.commentState) {
        return this.state.commentState[id];
      }
      else {
        return { formExpanded: true };
      }
    }
    else {
      return this.state.postState;
    }
  },

  replaceComments: function(newComments) {
    this.state.comments = newComments;
    this.emit('change');
  }
});

module.exports = RedditStore;
