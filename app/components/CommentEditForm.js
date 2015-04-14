var React = require('react');
var autosize = require('autosize');
var Fluxxor = require('fluxxor');

var FluxMixin = Fluxxor.FluxMixin(React);

var CommentForm = React.createClass({
  mixins: [FluxMixin],

  getStateFromFlux: function() {
    return this.getFlux().store('RedditStore').getState();
  },

  componentDidMount: function() {
    autosize($(React.findDOMNode(this)).find('.textarea'));
  },

  render: function() {
    return (
        <form className="edit">
            <div className="textarea-wrapper" >
                <div>
                    <textarea className="textarea"  style={{resize: 'none', overflow: 'hidden', height: '128px'}}>{this.props.comment.body}</textarea>
                </div>
                <div className="post-actions">
                    <div className="logged-in">
                        <section>
                            <div className="temp-post">
                                <button className="btn" type="submit" onClick={this.onSubmit}>Save Edit</button>
                                <a className="cancel" href="#" onClick={this.onCancel}>Cancel</a>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </form>
    );
  },

  onSubmit: function(e) {
    e.preventDefault();
    var textArea = $(e.target).closest('.textarea-wrapper').find('.textarea');
    this.props.onSubmit(textArea.val());
  },

  onCancel: function(e) {
    e.preventDefault();
    this.props.onSubmit(null); // Null signals that no change was made
  }
});

module.exports = CommentForm;