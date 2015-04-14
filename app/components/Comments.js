var React = require('react');
var Fluxxor = require('fluxxor');
var CommentsHeader = require('./CommentsHeader');
var CommentsNavigation = require('./CommentsNavigation');
var CommentForm = require('./CommentForm');
var CommentList = require('./CommentList');

var FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

var Comments = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin('RedditStore')],

  getStateFromFlux: function() {
    return this.getFlux().store("RedditStore").getState();
  },

  render: function() {
    var navigation = this.state.post ? <CommentsNavigation/> : null;
    return (
        <div>
            <CommentsHeader/>
            <section id="conversation"  data-tracking-area="main">
                {navigation}
                
                <div id="posts">
                    <div id="form">
                        <CommentForm/>
                    </div>
                </div>
            </section>
            <CommentList/>
        </div>
    );
  }
});

module.exports = Comments;