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

  render: function() {
    var footerNormal = { paddingLeft: '0px' };
    var footerLink = Object.assign({ textDecoration: 'underline' }, footerNormal);
    return (
      <div>
        <Tabs ref="tabs" tabActive={2} onAfterChange={this.onTabChanged}>
          <Tabs.Panel title={`Disqus ${this.state.disqus.commentCount ? '(' + this.state.disqus.commentCount + ')': ''}`}>
            <DisqusThread
              shortname={this.state.disqus.forum}
              identifier={this.state.disqus.identifier}
              url={this.state.disqus.url}/>
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
        <div id="footer">
          <a style={footerNormal}>SuperComments </a>
          <a style={footerLink} href="https://www.salsitasoft.com/mobile-and-web-apps/solutions/web-apps" target="_blank">web app development</a>
          <a style={footerNormal}> by the </a>
          <a style={footerLink} href="https://www.salsitasoft.com/javascript-engineers/full-stack-development/react" target="_blank">React developers</a>
          <a style={footerNormal}> of </a>
          <a style={footerLink} href="https://www.salsitasoft.com" target="_blank">Salsita Software</a>
        </div>
      </div>
    );
  },

  onTabChanged: function(selectedIndex) {
    if (selectedIndex === 1) {
      this.watchTabChanges();
    }
    else {
      this.unwatchTabChanges();
    }
  },

  watchTabChanges: function() {
    if (!this.state.observer) {
      this.state.observer = new MutationObserver(() => {
        this.getFlux().actions.reloadDisqusCommentCount();
      });
    }
    this.state.observer.observe(this.refs.tabs.getDOMNode(), {
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true
    });
  },

  unwatchTabChanges: function() {
    if (this.state.observer) {
      this.state.observer.disconnect();
    }
  }
});

module.exports = Comments;