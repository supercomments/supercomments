'use strict';

var Fluxxor = require('fluxxor');
var Constants = require('../constants/Constants');

var ItemStateStore = Fluxxor.createStore({
  initialize: function() {
    this.state = {
      post: {},
      comments: {}
    };
    this.bindActions(
      Constants.ITEM_CHANGED, this.onItemChanged,
      Constants.ITEM_REMOVED, this.onItemRemoved,
      Constants.SUBMITTING_COMMENT, this.onSubmittingComment,
      Constants.SUBMITTED_COMMENT, this.onSubmittedComment,
      Constants.EDITING_COMMENT, this.onEditingComment,
      Constants.EDITED_COMMENT, this.onEditedComment,
      Constants.DELETING_COMMENT, this.onDeletingComment,
      Constants.DELETED_COMMENT, this.onDeletedComment,
      Constants.VOTING, this.onVoting,
      Constants.VOTED, this.onVoted
    );
  },

  onItemChanged: function(payload) {
    var comment = payload.comment;
    var newState = payload.newState;
    var state = this.getItemState(comment);
    Object.keys(newState).forEach((key) => {
      state[key] = newState[key];
    });
    if (comment) {
      this.state.comments[comment.id] = state;
    }
    else {
      this.state.post = state;
    }
    this.emit('change');
  },

  onItemRemoved: function(comment) {
    if (comment) {
      this.state.comments.delete(comment.id);
    }
    else {
      this.state.post = {};
    }
  },

  onSubmittingComment: function(payload) {
    this.state.comments[payload.id] = { disabled: true };
  },

  onSubmittedComment: function(payload) {
    delete this.state.comments[payload.id];
  },

  onEditingComment: function(payload) {
    this.state.comments[payload.comment.id] = { disabled: true };
  },

  onEditedComment: function(comment) {
    this.state.comments[comment.id] = { disabled: false };
    this.emit('change');
  },

  onDeletingComment: function(comment) {
    this.state.comments[comment.id] = { disabled: true };
  },

  onDeletedComment: function(comment) {
    this.state.comments[comment.id] = { disabled: false };
    this.emit('change');
  },

  onVoting: function(thing) {
    // Check that we're managing state for this ID since the
    // user can vote on posts, not just comments
    if (thing.id in this.state.comments) {
      this.state.comments[thing.id] = { disabled: true };
    }
  },

  onVoted: function(thing) {
    if (thing.id in this.state.comments) {
      this.state.comments[thing.id] = { disabled: false };
      this.emit('change');
    }
  },

  getItemState: function(comment) {
    if (!comment) {
      return this.state.post;
    }
    else if (comment.id in this.state.comments) {
      return this.state.comments[comment.id];
    }
    else {
      return { formExpanded: true };
    }
  }
});

module.exports = ItemStateStore;
