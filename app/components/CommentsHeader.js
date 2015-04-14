var React = require('react');
var Fluxxor = require('fluxxor');
var CommentsUser = require('./CommentsUser');

var FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

function countComments(comments) {
  if (!comments) {
    return;
  }
  return comments.reduce((current, comment) => {
    var children = comment.replies;
    return current + 1 + (children ? countComments(children) : 0);
  }, 0);
}


var CommentsHeader = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin('RedditStore')],

  getStateFromFlux: function() {
    var flux = this.getFlux();
    var state = flux.store("RedditStore").getState();
    state.commentCount = state.comments ? countComments(state.comments) : null;
    return state;
  },

  render: function() {
    var subreddit = this.state.subreddit;
    var subredditURL = '';
    if (subreddit) {
      subreddit = 'r/' + subreddit.charAt(0).toUpperCase() + subreddit.slice(1);
      subredditURL = 'http://www.reddit.com/' + subreddit;
    }
    return (
      <header id="main-nav">
          <nav className="nav nav-primary">
              <ul>
                  <li className="tab-conversation active">
                      <a href={this.state.permalink}  className="publisher-nav-color">
                        <span className="comment-count">{this.state.commentCount} comments</span>
                        <span className="comment-count-placeholder">
                          Comments
                        </span>
                      </a>
                  </li>
                  <li className="tab-community">
                      <a href={subredditURL} className="publisher-nav-color" id="community-tab">
                          <span className="community-name">
                            <strong>{subreddit}</strong>

                          </span>
                          <strong className="community-name-placeholder">Community</strong>
                      </a>
                  </li>
                  <CommentsUser/>
                  <li className="notification-menu" >
                      <a href="https://disqus.com/home/inbox/" className="notification-container">
                          <span className="notification-icon icon-comment"></span>
                          <span className="notification-count"></span>
                      </a>
                  </li>
              </ul>
          </nav>
      </header>
    );
  }
});

module.exports = CommentsHeader;