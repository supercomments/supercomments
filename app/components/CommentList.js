let React = require('react');
let Fluxxor = require('fluxxor');
let Cursor = require('immutable/contrib/cursor');
let CommentItem = require('./CommentItem');

let FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

let CommentList = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin('RedditStore')],

  getStateFromFlux() {
    return this.getFlux().store('RedditStore').getState();
  },

  render() {
    let commentNodes = this.mapComments(null, this.state.permalink);
    return (
      <ul id="post-list" className="post-list">
        {commentNodes}
      </ul>
    );
  },

  makeCommentItem(comment, postUrl, parentAuthor) {
    return (
      <CommentItem key={comment.get('id')} comment={comment} postUrl={postUrl} parentAuthor={parentAuthor}>
        {this.mapComments(comment, postUrl, comment.get('author'))}
      </CommentItem>
    );
  },

  mapComments(parent, postUrl) {
    let store = this.getFlux().store('RedditStore');
    if (parent) {
      let parentAuthor = parent.get('author');
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