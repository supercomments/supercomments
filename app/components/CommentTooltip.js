let React = require('react');
let Fluxxor = require('fluxxor');

let FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

let CommentTooltip = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin('RedditStore')],

  getStateFromFlux() {
    let state = this.getFlux().store("RedditStore").getState();
    if (state.tooltip) {
      state.bottom = state.tooltip.node.getBoundingClientRect().top;
    }
    return state;
  },

  componentDidUpdate(/* prevProps, prevState */) {
    if (this.state.tooltip) {
      document.addEventListener('click', this.onHideTooltip, false);
    }
    else {
      document.removeEventListener('click', this.onHideTooltip, false);
    }
  },

  render() {
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

  onHideTooltip() {
    this.getFlux().actions.hideTooltip();
  }
});

module.exports = CommentTooltip;