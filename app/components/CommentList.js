var React = require('react');
var Fluxxor = require('fluxxor');
var Cursor = require('immutable/contrib/cursor');
var CommentItem = require('./CommentItem');

var FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

var CommentList = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin('RedditStore')],

  getStateFromFlux: function() {
    return this.getFlux().store('RedditStore').getState();
  },

  render: function() {
    var commentNodes = this.mapComments(null, this.state.permalink);
    return (
      <ul id="post-list" className="post-list">
        {commentNodes}
      </ul>
    );
  },

  makeCommentItem: function(comment, postUrl, parentAuthor) {
    return (
      <CommentItem key={comment.get('id')} comment={comment} postUrl={postUrl} parentAuthor={parentAuthor}>
        {this.mapComments(comment, postUrl, comment.get('author'))}
      </CommentItem>
    );
  },

  mapComments: function(parent, postUrl) {
    var store = this.getFlux().store('RedditStore');
    if (parent) {
      var parentAuthor = parent.get('author');
      return parent.get('replies').map((comment) => {
        return this.makeCommentItem(comment, postUrl, parentAuthor);
      }).toArray();
    }
    else {
      return this.state.comments.map((comment, index) => {
        let cursor = Cursor.from(this.state.comments, [ index ], store.replaceComments);
        return this.makeCommentItem(cursor, postUrl);
      }).toArray();
    }
  },
});

module.exports = CommentList;