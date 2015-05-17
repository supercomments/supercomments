let React = require('react');
let Fluxxor = require('fluxxor');
let Textarea = require('react-textarea-autosize');

let FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

let CommentEditForm = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin('RedditStore')],

  componentWillMount() {
    this.getFlux().actions.itemChanged({ comment: this.props.comment, newState: { editBody: this.props.comment.get('body') }});
  },

  getStateFromFlux() {
    return this.getFlux().store('RedditStore').getItemState(this.props.comment);
  },

  render() {
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

  onChange(e) {
    this.getFlux().actions.itemChanged({ comment: this.props.comment, newState: { editBody: e.target.value }});
  },

  onSubmit() {
    this.getFlux().actions.editComment({
      comment: this.props.comment,
      body: this.state.editBody
    });
    this.getFlux().actions.itemChanged({ comment: this.props.comment, newState: { editFormVisible: false }});
  },

  onCancel() {
    this.getFlux().actions.itemChanged({ comment: this.props.comment, newState: { editFormVisible: false }});
  }
});

module.exports = CommentEditForm;