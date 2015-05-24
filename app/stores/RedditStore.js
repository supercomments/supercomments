let Fluxxor = require('fluxxor');
let Constants = require('../constants/Constants');
let Immutable = require('immutable');
let capitalize = require('capitalize');

function countComments(comments) {
  if (!comments) {
    return;
  }
  return comments.reduce((current, comment) => {
    let children = comment.get('replies');
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
      let comment = mapRedditComment(redditComment.data);
      return Immutable.fromJS(comment);
    })
  );
}

function isComment(thing) {
  return thing && thing.get('name').substr(0, 3) === 't1_';
}

let RedditStore = Fluxxor.createStore({
  initialize() {
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

  onUpdatingUrl(payload) {
    if ('reddit' in payload.config) {
      this.state.consumerKey = payload.config.reddit.consumerKey;
      this.state.redirectUri = payload.config.reddit.redirectUri;
    }
    this.state.url = payload.url;
    this.state.postLoaded = false;
    this.state.commentsLoaded = false;

    this.emit('change');
  },

  onUpdatedUrl(payload) {
    if ('reddit' in payload) {
      let post = payload.reddit;
      if (post) {
        this.state.permalink = 'http://www.reddit.com' + post.permalink;
        this.state.subreddit = `/r/${capitalize(post.subreddit)}`;
        this.state.subredditUrl = `http://www.reddit.com${this.state.subreddit}`;
        this.state.post = Immutable.fromJS(mapRedditPost(post));
      }
      this.state.postLoaded = true;
      this.emit('change');
    }
  },

  onLoggingIn() {
    this.state.loggingIn = true;
    this.emit('change');
  },

  onLoggedIn(payload) {
    this.state.loggingIn = false;
    this.state.userName = payload.userName;
    this.state.unreadCount = payload.unreadCount;
    this.emit('change');
  },

  onLogout() {
    this.state.userName = null;
    this.emit('change');
  },

  onUnreadMessagesRead() {
    this.state.unreadCount = 0;
    this.emit('change');
  },

  onSubmittingComment(payload) {
    let parent = payload.parent;
    // Create a temporary comment so we can update the UI while we wait for the real one
    let comment = Immutable.fromJS({
      id: payload.id,
      author: this.state.userName,
      body: payload.body,
      likes: true,
      score: 1,
      disabled: true,
      replies: []
    });
    let newParent;
    if (isComment(parent)) {
      // Remember the new parent since we'll need to update it when the comment is submitted
      newParent = parent.update('replies', (list) => list.unshift(comment));
    }
    else {
      this.state.comments = this.state.comments.unshift(comment);
    }
    this.state.commentCount = this.state.commentCount ? this.state.commentCount+1 : 1;
    this.onItemChanged({ comment: comment, newState: { parent: newParent, disabled: true }});
    this.emit('change');
  },

  onSubmittedComment(payload) {
    let parent = this.state.commentState[payload.id].parent;
    delete this.state.commentState[payload.id]; // delete the temporary comment state
    let redditComment = payload.comment;
    let comment = Immutable.fromJS(mapRedditComment(redditComment));
    let mapComments = (value) => {
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

  onReloadingComments() {
    this.state.commentsLoaded = false;
    this.emit('change');
  },

  onReloadedComments(payload) {
    if (payload) {
      this.state.post = Immutable.fromJS(mapRedditPost(payload.post));
      this.state.comments = getCommentsFromListing(payload.comments);
      this.state.commentCount = countComments(this.state.comments);
    }
    this.state.commentsLoaded = true;
    this.emit('change');
  },

  onVoting(payload) {
    let thing = payload.thing;
    this.onItemChanged({ comment: thing, newState: { disabled: true }});
    let dir = payload.dir;
    // `false` means dislike, `null` means neither like nor dislikes
    let previousLikes = thing.get('likes') ? 1 : (thing.get('likes') === false ? -1 : 0);
    thing = thing.update('likes', () => dir === 1 ? true : (dir === 0 ? null : false));
    thing = thing.update('score', score => score - previousLikes + dir);
    // TODO: figure out a better way to handle comments vs. posts without weird hacks
    if (!isComment(thing)) {
      this.state.post = thing;
    }
    this.emit('change');
  },

  onVoted(thing) {
    this.onItemChanged({ comment: thing, newState: { disabled: false }});
    this.emit('change');
  },

  onEditingComment(payload) {
    let comment = payload.comment;
    this.onItemChanged({ comment: comment, newState: { disabled: true }});
    comment.update('body', () => payload.body);
    this.emit('change');
  },

  onEditedComment(comment) {
    this.onItemChanged({ comment: comment, newState: { disabled: false }});
    this.emit('change');
  },

  onDeletingComment(comment) {
    this.onItemChanged({ comment: comment, newState: { disabled: true }});
    comment = comment.update('author', () => '[deleted]');
    comment.update('body', () => '[deleted]');
    this.emit('change');
  },

  onDeletedComment(comment) {
    this.onItemChanged({ comment: comment, newState: { disabled: false }});
  },

  onReportingComment(/* comment */) {
  },

  onReportedComment(/* comment */) {
  },

  onSortByBest() {
    this.changeSortBy('best');
  },

  onSortByNewest() {
    this.changeSortBy('new');
  },

  onSortByOldest() {
    this.changeSortBy('old');
  },

  changeSortBy(order) {
    if (this.state.sortBy !== order) {
      this.state.sortBy = order;
      this.state.commentsLoaded = false;
      this.emit('change');
    }
  },

  onSetTooltip(tooltip) {
    this.state.tooltip = tooltip;
    this.emit('change');
  },

  onItemChanged(payload) {
    let comment = payload.comment;
    let newState = payload.newState;
    let state = Object.assign(this.getItemState(comment), newState);
    if (comment) {
      this.state.commentState[comment.get('id')] = state;
    }
    else {
      this.postState = state;
    }
    this.emit('change');
  },

  getState() {
    return this.state;
  },

  getItemState(comment) {
    if (comment) {
      let id = comment.get('id');
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

  replaceComments(newComments) {
    this.state.comments = newComments;
    this.emit('change');
  }
});

module.exports = RedditStore;
