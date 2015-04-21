var React = require('react');
var Fluxxor = require('fluxxor');
var CommentsUser = require('./CommentsUser');

var FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

var CommentsHeader = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin('RedditStore')],

  getStateFromFlux: function() {
    return this.getFlux().store("RedditStore").getState();
  },

  render: function() {
    return (
      <header id="main-nav">
          <nav className="nav nav-primary">
              <ul>
                  <li className="tab-conversation active">
                      <a href={this.state.permalink}  className="publisher-nav-color">
                        <span className="comment-count">
                          {this.state.commentCount} comments
                        </span>
                        <span className="comment-count-placeholder">
                          {this.state.commentCount} comments
                        </span>
                      </a>
                  </li>
                  <li className="tab-community">
                      <a href={this.state.subredditUrl} className="publisher-nav-color" id="community-tab">
                          <span className="community-name">
                            <strong>{this.state.subreddit}</strong>
                          </span>
                          <strong className="community-name-placeholder">{this.state.subreddit}</strong>
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