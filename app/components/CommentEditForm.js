var React = require('react');
var Fluxxor = require('fluxxor');
var Textarea = require('react-textarea-autosize');

var FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

var CommentEditForm = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin('RedditStore')],

  componentWillMount: function() {
    this.getFlux().actions.itemChanged({ comment: this.props.comment, newState: { editBody: this.props.comment.get('body') }});
  },

  getStateFromFlux: function() {
    return this.getFlux().store('RedditStore').getItemState(this.props.comment);
  },

  render: function() {
    return (
        <form className="edit">
            <div className="textarea-wrapper" >
                <div>
                    <Textarea
                        className="textarea"
                        style={{resize: 'none', overflow: 'hidden', height: '128px'}}
                        value={this.state.editBody}
                        onChange={this.onChange}
                    />
                </div>
                <div className="post-actions">
                    <div className="logged-in">
                        <section>
                            <div className="temp-post">
                                <button className="btn" type="button" onClick={this.onSubmit}>Save Edit</button>
                                <a className="cancel" onClick={this.onCancel}>Cancel</a>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </form>
    );
  },

  onChange: function(e) {
    this.getFlux().actions.itemChanged({ comment: this.props.comment, newState: { editBody: e.target.value }});    
  },

  onSubmit: function() {
    this.getFlux().actions.editComment({
      comment: this.props.comment,
      body: this.state.editBody
    });
    this.getFlux().actions.itemChanged({ comment: this.props.comment, newState: { editFormVisible: false }});
  },

  onCancel: function() {
    this.getFlux().actions.itemChanged({ comment: this.props.comment, newState: { editFormVisible: false }});
  }
});

module.exports = CommentEditForm;