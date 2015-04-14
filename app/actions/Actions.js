var Constants = require('../constants/Constants');

var Actions = {
  updateUrl: function(url) {
    this.dispatch(Constants.UPDATE_URL, url);
  },

  login: function() {
    this.dispatch(Constants.LOGIN);
  },

  logout: function() {
    this.dispatch(Constants.LOGOUT);
  },

  submitComment: function(payload) {
    this.dispatch(Constants.SUBMIT_COMMENT, payload);
  },

  sortByBest: function() {
    this.dispatch(Constants.SORT_BY_BEST);
  },

  sortByNewest: function() {
    this.dispatch(Constants.SORT_BY_NEWEST);
  },

  sortByOldest: function() {
    this.dispatch(Constants.SORT_BY_OLDEST);
  },

  vote: function(payload) {
    this.dispatch(Constants.VOTE, payload);
  },

  editComment: function(payload) {
    this.dispatch(Constants.EDIT_COMMENT, payload);
  },

  deleteComment: function(payload) {
    this.dispatch(Constants.DELETE_COMMENT, payload);
  },

  reportComment: function(comment) {
    this.dispatch(Constants.REPORT_COMMENT, comment);
  }
};

module.exports = Actions;