var React = require('react');
var Fluxxor = require('fluxxor');
var Textarea = require('react-textarea-autosize');

var FluxMixin = Fluxxor.FluxMixin(React);

var CommentEditForm = React.createClass({
  mixins: [FluxMixin],

  getInitialState: function() {
    return { body: this.props.item.props.comment.body};
  },

  getStateFromFlux: function() {
    return this.getFlux().store('RedditStore').getState();
  },

  render: function() {
    return (
        <form className="edit">
            <div className="textarea-wrapper" >
                <div>
                    <Textarea
                        className="textarea"
                        style={{resize: 'none', overflow: 'hidden', height: '128px'}}
                        value={this.state.body}
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
    this.setState({ body: e.target.value });    
  },

  onSubmit: function() {
    this.getFlux().actions.editComment({
      comment: this.props.item.props.comment,
      body: this.state.body
    });
    this.getFlux().actions.itemChanged({ item: this.props.item, newState: { editFormVisible: false }});
  },

  onCancel: function() {
    this.getFlux().actions.itemChanged({ item: this.props.item, newState: { editFormVisible: false }});
  }
});

module.exports = CommentEditForm;