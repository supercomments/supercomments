let React = require('react');
let classNames = require('classnames');
let Showdown = require('showdown');
let moment = require('moment');
let Fluxxor = require('fluxxor');
let CommentForm = require('./CommentForm.js');
let CommentEditForm = require('./CommentEditForm.js');

let FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

let converter = new Showdown.Converter();

let CommentItem = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin('RedditStore')],

  getStateFromFlux() {
    let state = this.getFlux().store('RedditStore').getItemState(this.props.comment);
    state.isAuthor = state.userName === this.props.comment.get('author');
    return state;
  },

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.comment.deref() !== nextProps.comment.deref()) {
      return true;
    }
    let oldKeys = Object.keys(this.state);
    let newKeys = Object.keys(nextState);
    if (oldKeys.length !== newKeys.length) {
      return true;
    }
    return oldKeys.some((key) => {
      return (!(key in nextState) || (this.state[key] !== nextState[key]));
    });
  },

  render() {
    let timestamp = moment.unix(this.props.comment.get('created_utc'));
    let timestampTitle = timestamp.format("dddd, MMMM Do, YYYY h:mm:ss a");
    let timestampFromNow = timestamp.fromNow();
    let classes = classNames({
      post: true,
      collapsed: this.state.collapsed
    });
    let contentClasses = classNames({
      'post-content': true,
      disabled: this.state.disabled
    });
    let upvoteClasses = classNames({
      'vote-up': true,
      upvoted: this.props.comment.get('likes')
    });
    let downvoteClasses = classNames({
      'vote-down': true,
      downvoted: this.props.comment.get('likes') === false
    });
    let replyClasses = classNames({
      reply: true,
      active: this.state.replyFormVisible
    });
    let editClasses = classNames({
      edit: true,
      active: this.state.editFormVisible
    });
    let isDeleted = this.props.comment.get('author') === '[deleted]';
    return (
      <li className={classes}>
          <div role="alert"/>
          <div className={contentClasses}>
              <ul className="post-menu dropdown">
                  <li className="collapse">
                      <a title="Collapse" onClick={this.onCollapseItem}><span>−</span></a>
                  </li>
                  <li className="expand">
                      <a title="Expand" onClick={this.onExpandItem}><span>+</span></a>
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
                      <img src={require('raw!../assets/alien-png.data')} alt="Avatar"></img>
                  </a>
              </div>

              <div className="post-body">
                  <header>
                      <span className="post-byline">
                        <span className="author publisher-anchor-color">
                          {isDeleted ?
                            this.props.comment.get('author') :
                            <a href={'https://www.reddit.com/user/' + this.props.comment.get('author')}>{this.props.comment.get('author')}</a>
                          }
                        </span>
                      </span>
                      {this.props.parentAuthor ?
                        <span><span className="parent-link"> <i className="icon-forward" title="in reply to"></i> {this.props.parentAuthor}</span></span> :
                        null
                      }
                      <span className="post-meta">
                        <span className="bullet time-ago-bullet" >•</span>
                        <a href={this.props.postUrl + this.props.comment.get('id')} className="time-ago" title={timestampTitle}>{timestampFromNow}</a>
                      </span>

                  </header>

                  <div className="post-body-inner">
                      <div className="post-message-container">
                          <div className="publisher-anchor-color">
                              {this.state.editFormVisible ?
                                <CommentEditForm visible="false" comment={this.props.comment}/> :
                                <div
                                  className="post-message "
                                  dangerouslySetInnerHTML={{__html: converter.makeHtml(this.props.comment.get('body'))}}/>
                              }

                              <span className="post-media"><ul></ul></span>
                          </div>
                      </div>
                      <a className="see-more hidden" title="see more" >see more</a>
                  </div>

                  {!isDeleted ?
                    <footer>
                        <menu>

                            <li className="voting" style={this.state.votePending ? { opacity: 0.5 } : {}}>
                                <a className={upvoteClasses} onClick={this.onUpvote} title="">

                                    <span className="updatable count">{this.props.comment.get('score')}</span>
                                    <span className="control"><i className="icon icon-arrow-2"></i></span>
                                </a>
                                <span role="button" className={downvoteClasses} onClick={this.onDownvote} title="Vote down">
                                  <span className="control"><i className="icon icon-arrow"></i></span>
                                </span>
                            </li>

                            <li className="bullet" >•</li>
                            <li className={replyClasses}>
                                <a onClick={this.onReply}>
                                    <i className="icon icon-mobile icon-reply"></i><span className="text">Reply</span>
                                </a>
                            </li>
                           {this.state.isAuthor ?
                              <div>
                                <li className="bullet">•</li>
                                <li className={editClasses}>
                                    <a onClick={this.onEdit}>
                                        <i className="icon icon-mobile icon-reply"></i><span className="text">Edit</span>
                                    </a>
                                </li>

                                <li className="bullet">•</li>
                                <li className="reply">
                                    <a onClick={this.onDelete}>
                                        <i className="icon icon-mobile icon-reply"></i><span className="text">Delete</span>
                                    </a>
                                </li>
                              </div> :
                              null
                            }
                        </menu>
                    </footer> :
                    null
                  }
              </div>

              <div></div>
              <div className="reply-form-container">
                {this.state.replyFormVisible ? <CommentForm comment={this.props.comment} expanded="true"/> : null}
              </div>
          </div>

          <ul className="children">
            {this.props.children}
          </ul>
      </li>
    );
  },

  onCollapseItem() {
    this.getFlux().actions.itemChanged({ comment: this.props.comment, newState: { collapsed: true }});
  },

  onExpandItem() {
    this.getFlux().actions.itemChanged({ comment: this.props.comment, newState: { collapsed: false }});
  },

  onReply() {
    this.getFlux().actions.itemChanged({ comment: this.props.comment, newState: { replyFormVisible: !this.state.replyFormVisible }});
  },

  onEdit() {
    this.getFlux().actions.itemChanged({ comment: this.props.comment, newState: { editFormVisible: !this.state.editFormVisible }});
  },

  onDelete() {
    this.getFlux().actions.deleteComment(this.props.comment);
  },

  onUpvote(e) {
    if (!this.getFlux().store('RedditStore').getState().userName) {
      this.getFlux().actions.setTooltip({ text: 'You must be logged in to upvote', node: e.target });
    }
    else {
      let payload = {
        thing: this.props.comment,
        dir: this.props.comment.get('likes') ? 0 : 1 // Back to neutral if we already like it
      };
      this.getFlux().actions.vote(payload);
    }
  },

  onDownvote(e) {
    if (!this.getFlux().store('RedditStore').getState().userName) {
      this.getFlux().actions.setTooltip({ text: 'You must be logged in to downvote', node: e.target });
    }
    else {
      let payload = {
        thing: this.props.comment,
        // We need to check for `false` explicitly since the Reddit API makes a distinction
        // between `false` (disliked) and `null` (neither liked nor disliked).
        dir: this.props.comment.get('likes') === false ? 0 : -1 // Back to neutral if we dislike it
      };
      this.getFlux().actions.vote(payload);
    }
  },

  onFlagItem() {
    this.getFlux().actions.reportComment(this.props.comment);
  }
});

module.exports = CommentItem;