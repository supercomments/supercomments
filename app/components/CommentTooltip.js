var React = require('react');
var Fluxxor = require('fluxxor');

var FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

var CommentTooltip = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin('RedditStore')],

  getStateFromFlux: function() {
    return this.getFlux().store("RedditStore").getState();
  },

  componentWillUpdate: function(nextProps, nextState) {
    if (nextState.tooltip) {
      nextState.bottom = nextState.tooltip.node.getBoundingClientRect().top;
    }
  },

  componentDidUpdate: function(/* prevProps, prevState */) {
    if (this.state.tooltip) {
      document.addEventListener('click', this.onHideTooltip, false);
    }
    else {
      document.removeEventListener('click', this.onHideTooltip, false);
    }
  },

  render: function() {
    if (!this.state.tooltip) {
      return null;
    }
    return (
      <div className="tooltip-outer" ref="tooltip" style={{ left: '60px', top: `${this.state.bottom}px`}}>
          <div className="vote-action tooltip">
              {this.state.tooltip.text}
          </div>
      </div>
    );
  },

  onHideTooltip: function() {
    this.getFlux().actions.setTooltip(null);
  }
});

module.exports = CommentTooltip;