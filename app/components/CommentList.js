var React = require('react');
var Fluxxor = require('fluxxor');
var CommentItem = require('./CommentItem');

var FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

function mapComments(comments, postUrl, parentAuthor) {
  if (!comments) {
    return [];
  }
  return comments.map((comment, index) => {
    return (
      <CommentItem key={index} comment={comment} postUrl={postUrl} parentAuthor={parentAuthor}>
        {mapComments(comment.replies, postUrl, comment.author)}
      </CommentItem>
    );
  });
}

var CommentList = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin('RedditStore')],

  getStateFromFlux: function() {
    var flux = this.getFlux();
    return flux.store("RedditStore").getState();
  },

  render: function() {
    var commentNodes = mapComments(this.state.comments, this.state.permalink);
    return (
      <ul id="post-list" className="post-list">
        {commentNodes}
      </ul>
    );
  }
});

module.exports = CommentList;