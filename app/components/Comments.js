let React = require('react');
let Fluxxor = require('fluxxor');
let Loader = require('react-loader');
let Tabs = require('react-simpletabs');
let CommentsHeader = require('./CommentsHeader');
let CommentsNavigation = require('./CommentsNavigation');
let CommentForm = require('./CommentForm');
let CommentList = require('./CommentList');
let CommentTooltip = require('./CommentTooltip');

let FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

let Comments = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin('RedditStore')],

  getInitialState() {
    return { disqus: { commentCount: null }};
  },

  getStateFromFlux() {
    let state = {
      reddit: this.getFlux().store('RedditStore').getState()
    };
    return state;
  },

  componentDidMount() {
    window.addEventListener('message', this.onWindowMessage, false);
  },

  componentWillUnmount() {
    window.removeEventListener('message', this.onWindowMessage, false);
  },

  render() {
    return (
      <div>
        <Tabs ref="tabs" onBeforeChange={this.onTabChanged}>
          <Tabs.Panel title={`Disqus ${this.state.disqus.commentCount ? '(' + this.state.disqus.commentCount + ')': ''}`}>
            <span></span>
          </Tabs.Panel>
          <Tabs.Panel title={`Reddit ${this.state.reddit.commentCount ? '(' + this.state.reddit.commentCount + ')': ''}`}>
            <div id="layout" style={{ overflow: 'visible', 'padding-top': '10px' }}>
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

  onTabChanged(selectedIndex) {
    if (selectedIndex === 1) {
      window.parent.postMessage({ msg: 'showDisqus' }, '*');
      // Cancel change, it will be triggered asynchronously by the Disqus frame once it is visible
      return false;
    }
    else {
      window.parent.postMessage({ msg: 'hideDisqus' }, '*');
    }
  },

  onWindowMessage(message) {
    if (typeof(message.data) === 'object' && ('msg' in message.data)) {
      if (message.data.msg === 'onDisqusCount') {
        this.setState({ disqus: { commentCount: message.data.count }});
      }
      else if (message.data.msg === 'onDisqusShown') {
        this.refs.tabs.setState({ tabActive: 1 });
      }
    }
  }
});

module.exports = Comments;