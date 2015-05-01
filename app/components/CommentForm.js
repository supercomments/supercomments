var React = require('react/addons');
var classNames = require('classnames');
var FormErrors = require('../constants/FormErrors');
var Fluxxor = require('fluxxor');
var Textarea = require('react-textarea-autosize');

var FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

const AVATAR_URL = "//a.disquscdn.com/next/embed/assets/img/noavatar92.b677f9ddbee6f4bb22f473ae3bd61b85.png";

// Form error handling

var CommentForm = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin('RedditStore')],

  getErrorText: function(error) {
    switch(error) {
      case FormErrors.PAGE_NOT_SUBMITTED:
        return <span>You must <a href={`http://www.reddit.com/submit?url=${encodeURIComponent(this.state.url)}`}
          target="_blank">submit this post to Reddit</a> before commenting.</span>;
      case FormErrors.COMMENT_EMPTY:
        return 'Comments can\'t be blank.';
    }
  },

  componentDidMount: function() {
    if (this.state.formExpanded) {
      this.refs.textarea.getDOMNode().focus();
    }
  },

  componentDidUpdate: function(prevProps, prevState) {
    if (prevState.formExpanded && !this.state.formExpanded) {
      React.findDOMNode(this.refs.textarea).blur();
    }
  },

  getStateFromFlux: function() {
    var state = this.getFlux().store('RedditStore').getItemState(this.props.comment);
    state.userName = this.getFlux().store('RedditStore').getState().userName;
    state.url = this.getFlux().store('RedditStore').getState().url;
    return state;
  },

  render: function() {
    var formClasses = classNames({
      reply: !!this.props.comment,
      expanded: this.state.formExpanded,
      authenticated: this.state.userName
    });

    return (
        <form className={formClasses}>
            <div className="postbox">
                <div role="alert" />
                <div className="avatar">
                    <span className="user">
                        <img src={AVATAR_URL} alt="Avatar"/>
                    </span>
                </div>

                <div className="textarea-wrapper" onClick={this.onFormClicked}>
                    <div>
                        {this.state.formExpanded ? null : <span className="placeholder">Join the discussion…</span>}
                        <Textarea
                          className="textarea"
                          ref="textarea"
                          tabIndex="0"
                          role="textbox"
                          style={{overflow: 'hidden'}}
                          value={this.state.replyBody}
                          onChange={this.onChange} />
                        <div style={{display: 'none'}}>
                            <ul className="suggestions">
                                <li className="header">
                                    <h5>in this conversation</h5>
                                </li>
                            </ul>
                        </div>
                    </div>
                    {this.state.postError ?
                      <div className="edit-alert">
                          <div className="alert error">
                              <a className="close" title="Dismiss" onClick={this.onDismissError}>×</a>
                              <span>
                                  <span className="icon icon-warning"></span>{this.getErrorText(this.state.postError)}
                              </span>
                          </div>
                      </div> :
                      null
                    }
                    <div className="post-actions">
                        <div className="logged-in">
                            <section>
                                <div className="temp-post" style={{textAlign: 'right'}}>
                                    <button className="btn" type="button" onClick={this.onSubmit}>
                                        Post as <span >{this.state.userName}</span>
                                    </button>
                                </div>
                            </section>
                        </div>                    
                    </div>
                </div>
                <div>
                  <br/>
                  <section>
                    {!this.props.comment ?
                      <div className="guest">
                          <h6 className="guest-form-title">
                              Comments hosted on <a href="http://www.reddit.com">Reddit&reg;</a> and managed by SuperComments&trade;&nbsp;
                          </h6>

                          <div className="what-is-disqus help-icon">
                              <div id="rules" className="tooltip show">
                                  <h3>Reddit is an online community where users vote on content</h3>
                                  <ul>
                                      <li><span>We care about your privacy, and we never spam.</span>
                                      </li>
                                      <li>
                                          <span>
                                              By creating an account, you agree to reddit&apos;s
                                              <a href="http://www.reddit.com/help/useragreement"> User Agreement </a>
                                              and <a href="http://www.reddit.com/help/privacypolicy">Privacy Policy</a>.
                                          </span>
                                      </li>
                                      <li><span>We&apos;re proud of them, and you should read them.</span>
                                      </li>
                                  </ul>
                                  <p className="clearfix">
                                    <a href="http://www.reddit.com/help/useragreement" className="btn btn-small" target="_blank">
                                      Read full terms and conditions
                                    </a>
                                  </p>
                              </div>
                          </div>
                        </div> :
                        null
                      }     
                    </section>
                </div>
            </div>
        </form>
    );
  },

  onChange: function(e) {
    this.getFlux().actions.itemChanged({ comment: this.props.comment, newState: { replyBody: e.target.value }});
  },

  onFormClicked: function() {
    this.getFlux().actions.itemChanged({ comment: this.props.comment, newState: { formExpanded: true }});
    React.findDOMNode(this.refs.textarea).focus();
  },

  onSubmit: function(e) {
    e.stopPropagation();
    this.getFlux().actions.submitComment({
      parent: this.props.comment,
      body: this.state.replyBody
    });
  },

  onDismissError: function() {
    this.getFlux().actions.itemChanged({ comment: this.props.comment, newState: { postError: null }});
  }
});

module.exports = CommentForm;