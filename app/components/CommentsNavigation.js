let React = require('react');
let Fluxxor = require('fluxxor');
let classNames = require('classnames');

let SORT_BY_TEXT = {
    'best' : 'Best',
    'new' : 'Newest',
    'old' : 'Oldest'
};

let FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

let CommentsNavigation = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin('RedditStore')],

  getStateFromFlux() {
    return this.getFlux().store("RedditStore").getState();
  },

  render() {
    let recommendClasses= classNames({
      'dropdown-toggle' : true,
      upvoted: this.state.post.get('likes')
    });
    let postScore = this.state.post ? this.state.post.get('score') : null;
    let postScoreStyle = postScore ? {} : { display: 'none' };
    return (
        <div className="nav nav-secondary" data-tracking-area="secondary-nav">
            <ul>
                <li id="recommend-button" className="recommend dropdown">
                    <div className="thread-likes">
                        <a onClick={this.onUpvote} title="Recommend this discussion" className={recommendClasses}>
                            <span className="icon-heart"></span>
                            <span className="label label-default">Upvote</span>
                            <span className="label label-recommended">Upvoted</span>
                            <span className="label label-count" style={postScoreStyle}>{postScore}</span>
                        </a>
                    </div>
                </li>
                <li id="thread-share-menu" className="dropdown share-menu hidden">
                    <a href="#" className="dropdown-toggle"  title="Share">
                        <span className="icon-export"></span>
                        <span className="label">Share</span>
                    </a>
                    <ul className="share-menu dropdown-menu">
                        <li className="share">Share this discussion on
                            <ul>
                                <li className="twitter">
                                    <a  href="#">Twitter</a>
                                </li>
                                <li className="facebook">
                                    <a  href="#">Facebook</a>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </li>
                <li  className="dropdown sorting pull-right">
                    <a href="#" className="dropdown-toggle" data-toggle="dropdown">
                        Sort by {SORT_BY_TEXT[this.state.sortBy]}<span className="caret"></span>
                    </a>
                    <ul className="dropdown-menu pull-right">
                        <li className={this.state.sortBy === 'best' ? 'selected' : ''}>
                            <a onClick={this.onBest}>Best<i className="icon-checkmark"></i></a>
                        </li>

                        <li className={this.state.sortBy === 'new' ? 'selected' : ''}>
                            <a onClick={this.onNewest}>Newest<i className="icon-checkmark"></i></a>
                        </li>

                        <li className={this.state.sortBy === 'old' ? 'selected' : ''}>
                            <a onClick={this.onOldest}>Oldest<i className="icon-checkmark"></i></a>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
    );
  },

  onBest() {
    this.getFlux().actions.sortByBest();
  },

  onNewest() {
    this.getFlux().actions.sortByNewest();
  },

  onOldest() {
    this.getFlux().actions.sortByOldest();
  },

  onUpvote() {
    this.getFlux().actions.vote({
      thing: this.state.post,
      dir: this.state.post.get('likes') ? 0 : 1
    });
  }
});

module.exports = CommentsNavigation;