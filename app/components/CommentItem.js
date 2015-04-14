var React = require('react');
var classNames = require('classnames');
var Showdown = require('showdown');
var moment = require('moment');
var Fluxxor = require('fluxxor');
var CommentForm = require('./CommentForm.js');
var CommentEditForm = require('./CommentEditForm.js');

var FluxMixin = Fluxxor.FluxMixin(React);

var CommentItem = React.createClass({
  mixins: [FluxMixin],

  getInitialState: function() {
    return { collapsed: false, editExpanded: false, replyExpanded: false };
  },

  render: function() {
    var converter = new Showdown.Converter();
    var timestamp = moment.unix(this.props.comment.created_utc);
    var timestampTitle = timestamp.format("dddd, MMMM Do, YYYY h:mm:ss a");
    var timestampFromNow = timestamp.fromNow();
    var permalink = this.props.postUrl + this.props.comment.id;
    var classes = classNames({
      post: true,
      collapsed: this.state.collapsed
    });
    var replyForm = this.state.replyExpanded ? <CommentForm parent={this.props.comment} expanded="true" onSubmit={this.onReplySubmit}/> : null;
    var editForm = this.state.editExpanded ? <CommentEditForm comment={this.props.comment} onSubmit={this.onEditSubmit}/> : null;
    var upvoteClasses = classNames({
      'vote-up': true,
      upvoted: this.props.comment.likes
    });
    var downvoteClasses = classNames({
      'vote-down': true,
      downvoted: this.props.comment.likes === false
    });
    var replyClasses = classNames({
      reply: true,
      active: this.state.replyExpanded
    });
    var editClasses = classNames({
      edit: true,
      active: this.state.editExpanded
    });
    var messageStyle = this.state.editExpanded ? { display: 'none' } : {};
    var userName = this.getFlux().store('RedditStore').getState().userName;
    var readonlyStyle = this.props.comment.author === userName ? {} : { display: 'none' };
    var deleted = this.props.comment.author === '[deleted]';
    var footerStyle = deleted ? { display: 'none' } : {};
    var author = deleted ?
      this.props.comment.author :
      <a href={'https://www.reddit.com/user/' + this.props.comment.author}>{this.props.comment.author}</a>;
    var parentLink = this.props.parentAuthor ?
      <span><span className="parent-link"> <i className="icon-forward" title="in reply to"></i> {this.props.parentAuthor}</span></span> :
      null;
    return (
      <li className={classes}>
          <div role="alert"/>
          <div className="post-content">
              <ul className="post-menu dropdown">
                  <li className="collapse">
                      <a href="#" title="Collapse" onClick={this.onCollapseItem}><span>−</span></a>
                  </li>
                  <li className="expand">
                      <a href="#" title="Expand" onClick={this.onExpandItem}><span>+</span></a>
                  </li>

                  <li className="" role="menu" style={{display: 'none'}}>
                      <a className="dropdown-toggle" href="#" title="Flag as inappropriate" onClick={this.onFlagItem}>
                          <i className="icon icon-flag"></i>
                      </a>
                  </li>
              </ul>
              <div className="indicator"/>
              <div className="avatar hovercard">
                  <a href="" className="user"  >
                      <img src="http://ichef.bbci.co.uk/news/304/media/images/62071000/png/_62071291_reddit-alien.png" alt="Avatar"></img>
                  </a>
              </div>

              <div className="post-body">
                  <header>
                      <span className="post-byline">
                        <span className="author publisher-anchor-color">{author}</span>
                      </span>
                      {parentLink}
                      <span className="post-meta">
                        <span className="bullet time-ago-bullet" >•</span>
                        <a href={permalink} className="time-ago" title={timestampTitle}>{timestampFromNow}</a>
                      </span>

                  </header>

                  <div className="post-body-inner">
                      <div className="post-message-container">
                          <div className="publisher-anchor-color">
                              {editForm}
                              <div className="post-message " dir="auto" dangerouslySetInnerHTML={{__html: converter.makeHtml(this.props.comment.body)}} style={messageStyle}></div>

                              <span className="post-media"><ul></ul></span>
                          </div>
                      </div>
                      <a className="see-more hidden" title="see more" >see more</a>
                  </div>

                  <footer style={footerStyle}>
                      <menu>

                          <li className="voting">
                              <a href="#" className={upvoteClasses} onClick={this.onUpvote} title="">

                                  <span className="updatable count">{this.props.comment.score}</span>
                                  <span className="control"><i className="icon icon-arrow-2"></i></span>
                              </a>
                              <span role="button" className={downvoteClasses} onClick={this.onDownvote} title="Vote down">
                                <span className="control"><i className="icon icon-arrow"></i></span>
                              </span>
                          </li>

                          <li className="bullet" >•</li>
                          <li className={replyClasses}>
                              <a href="#" onClick={this.onReply}>
                                  <i className="icon icon-mobile icon-reply"></i><span className="text">Reply</span>
                              </a>
                          </li>

                          <li className="bullet"  style={readonlyStyle}>•</li>
                          <li className={editClasses} style={readonlyStyle}>
                              <a href="#" onClick={this.onEdit}>
                                  <i className="icon icon-mobile icon-reply"></i><span className="text">Edit</span>
                              </a>
                          </li>

                          <li className="bullet"  style={readonlyStyle}>•</li>
                          <li className="reply" style={readonlyStyle}>
                              <a href="#" onClick={this.onDelete}>
                                  <i className="icon icon-mobile icon-reply"></i><span className="text">Delete</span>
                              </a>
                          </li>

                          <li className="realtime">
                              <span style={{display:'none'}} className="realtime-replies"></span>
                              <a style={{display:'none'}} href="#" className="btn btn-small"></a>
                          </li>

                      </menu>
                  </footer>
              </div>

              <div></div>
              <div className="reply-form-container">
                {replyForm}
              </div>
          </div>

          <ul className="children">
            {this.props.children}
          </ul>
      </li>
    );    
  },

  onCollapseItem: function(e) {
    e.preventDefault();
    this.setState({ collapsed: true });
  },

  onExpandItem: function(e) {
    e.preventDefault();
    this.setState({ collapsed: false });
  },

  onReply: function(e) {
    e.preventDefault();
    this.setState({ replyExpanded: !this.state.replyExpanded });
  },

  onReplySubmit: function() {
    this.setState({ replyExpanded: false });
  },

  onEdit: function(e) {
    e.preventDefault();
    this.setState({ editExpanded: !this.state.editExpanded });
  },

  onEditSubmit: function(body) {
    this.setState({ editExpanded: false });
    this.getFlux().actions.editComment({
      comment: this.props.comment,
      body: body
    });
  },

  onDelete: function(e) {
    e.preventDefault(e);
    this.getFlux().actions.deleteComment(this.props.comment);
  },

  onUpvote: function(e) {
    e.preventDefault();
    var payload = {
      thing: this.props.comment,
      dir: this.props.comment.likes ? 0 : 1 // Back to neutral if we already like it
    };
    this.getFlux().actions.vote(payload);
  },

  onDownvote: function(e) {
    e.preventDefault();
    var payload = {
      thing: this.props.comment,
      dir: this.props.comment.likes === false ? 0 : -1 // Back to neutral if we dislike it
    };
    this.getFlux().actions.vote(payload);
  },

  onFlagItem: function(e) {
    e.preventDefault(e);
    this.getFlux().actions.reportComment(this.props.comment);
  }
});

module.exports = CommentItem;