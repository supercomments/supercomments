var React = require('react');
var Fluxxor = require('fluxxor');
var Loader = require('react-loader');
var DisqusThread = require('react-disqus-thread');
var Tabs = require('react-simpletabs');
var CommentsHeader = require('./CommentsHeader');
var CommentsNavigation = require('./CommentsNavigation');
var CommentForm = require('./CommentForm');
var CommentList = require('./CommentList');
var CommentTooltip = require('./CommentTooltip');

var FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

var Comments = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin('RedditStore', 'DisqusStore')],

  getStateFromFlux: function() {
    var state = {
      reddit: this.getFlux().store('RedditStore').getState(),
      disqus: this.getFlux().store('DisqusStore').getState()
    };
    return state;
  },

  componentDidMount: function() {
    window.addEventListener('message', this.onWindowMessage, false);
  },

  componentWillUnmount: function() {
    window.removeEventListener('message', this.onWindowMessage, false);
  },

  render: function() {
    var footerNormal = { paddingLeft: '0px' };
    var footerLink = Object.assign({ textDecoration: 'underline' }, footerNormal);
    return (
      <div>
        <Tabs ref="tabs" onBeforeChange={this.onTabChanged}>
          <Tabs.Panel title={`Disqus ${this.state.disqus.commentCount ? '(' + this.state.disqus.commentCount + ')': ''}`}>
            <span></span>
          </Tabs.Panel>
          <Tabs.Panel title={`Reddit ${this.state.reddit.commentCount ? '(' + this.state.reddit.commentCount + ')': ''}`}>
            <div id="layout" style={{overflow: 'visible'}}>
              <div>
                <CommentsHeader/>
                <Loader className="react-loader" loaded={this.state.reddit.postLoaded && !this.state.reddit.loggingIn} top="20%">
                  <section id="conversation"  data-tracking-area="main">
                      {this.state.reddit.post ? <CommentsNavigation/> : null}

                      <div id="posts">
                          <div id="form">
                              <CommentForm/>
                          </div>
                      </div>
                  </section>
                  <Loader className="react-loader" loaded={this.state.reddit.commentsLoaded} top="40%">
                    <CommentList/>
                  </Loader>
                </Loader>
              </div>
              <CommentTooltip/>
            </div>
          </Tabs.Panel>
        </Tabs>
      </div>
    );
  },

  onTabChanged: function(selectedIndex) {
    if (selectedIndex === 1) {
      window.parent.postMessage('showDisqus', '*');
    }
    else {
      window.parent.postMessage('hideDisqus', '*');
    }
  },

  onWindowMessage: function(message) {
    if (typeof(message.data) === 'string' && message.data === 'onDisqusChanged') {
      this.getFlux().actions.reloadDisqusCommentCount();
    }
  }
});

module.exports = Comments;