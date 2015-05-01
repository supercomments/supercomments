var React = require('react');
var Fluxxor = require('fluxxor');
var Loader = require('react-loader');
var CommentsHeader = require('./CommentsHeader');
var CommentsNavigation = require('./CommentsNavigation');
var CommentForm = require('./CommentForm');
var CommentList = require('./CommentList');
var CommentTooltip = require('./CommentTooltip');

var FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

var Comments = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin('RedditStore')],

  getStateFromFlux: function() {
    return this.getFlux().store("RedditStore").getState();
  },

  render: function() {
    return (
      <div id="layout" style={{overflow: 'visible'}}>
        <div>
          <CommentsHeader/>
          <Loader loaded={this.state.postLoaded && !this.state.loggingIn} top="20%">
            <section id="conversation"  data-tracking-area="main">
                {this.state.post ? <CommentsNavigation/> : null}
                
                <div id="posts">
                    <div id="form">
                        <CommentForm/>
                    </div>
                </div>
            </section>
            <Loader loaded={this.state.commentsLoaded} top="30%">
              <CommentList/>
            </Loader>
          </Loader>
        </div>
        <CommentTooltip/>
      </div>
    );
  }
});

module.exports = Comments;