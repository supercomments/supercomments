let React = require('react');
let Fluxxor = require('fluxxor');
let classNames = require('classnames');
let CommentsUser = require('./CommentsUser');

let FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

let CommentsHeader = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin('RedditStore')],

  getStateFromFlux() {
    return this.getFlux().store("RedditStore").getState();
  },

  render() {
    let notificationClasses = classNames({
      'notification-menu': true,
      unread: this.state.unreadCount > 0
    });
    return (
      <header id="main-nav">
          <nav className="nav nav-primary">
              <ul>
                  <li className="tab-conversation active">
                      <a href={this.state.permalink} target="_blank" className="publisher-nav-color">
                        <span className="comment-count">
                          {this.state.commentCount} comments
                        </span>
                        <span className="comment-count-placeholder">
                          {this.state.commentCount} comments
                        </span>
                      </a>
                  </li>
                  <li className="tab-community">
                      <a href={this.state.subredditUrl} target="_blank" className="publisher-nav-color" id="community-tab">
                          <span className="community-name">
                            <strong>{this.state.subreddit}</strong>
                          </span>
                          <strong className="community-name-placeholder">{this.state.subreddit}</strong>
                      </a>
                  </li>
                  <CommentsUser/>
                  <li className={notificationClasses} style={{ 'margin-right': '4px' }}>
                      <a href="http://www.reddit.com/message/inbox/" target="_blank" className="notification-container" onClick={this.onInbox}>
                          <span className="notification-icon icon-comment"></span>
                          <span className="notification-count">{this.state.unreadCount ? this.state.unreadCount : null}</span>
                      </a>
                  </li>
              </ul>
          </nav>
      </header>
    );
  },

  onInbox() {
    this.getFlux().actions.clearUnreadCount();
  }
});

module.exports = CommentsHeader;