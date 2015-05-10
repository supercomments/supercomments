var React = require('react/addons');
var classNames = require('classnames');
var FormMessages = require('../constants/FormMessages');
var Fluxxor = require('fluxxor');
var Textarea = require('react-textarea-autosize');

var FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

const AVATAR_URL = "//a.disquscdn.com/next/embed/assets/img/noavatar92.b677f9ddbee6f4bb22f473ae3bd61b85.png";

// Form error handling

var CommentForm = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin('RedditStore')],

  getMessageText: function(message) {
    switch(message) {
      case FormMessages.PAGE_NOT_SUBMITTED:
        return <span>You must <a href={`http://www.reddit.com/submit?url=${encodeURIComponent(this.state.url)}`}
          onClick={this.onRedditSubmissionPageOpened} target="_blank">submit this post to Reddit</a> before commenting.</span>;
      case FormMessages.COMMENT_EMPTY:
        return 'Comments can\'t be blank.';
      case FormMessages.REDDIT_SUBMISSION_PENDING:
        return 'It can take up to 30 seconds for your submission to be available.';
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
    var alertClasses = classNames({
      alert: true,
      error: this.state.postMessage && this.state.postMessage.error,
      success: this.state.postMessage && !this.state.postMessage.error
    });
    var buttonClasses = classNames({
      btn: true,
      disabled: this.state.submitPending
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
                    {this.state.postMessage ?
                      <div className="edit-alert">
                          <div className={alertClasses}>
                              <a className="close" title="Dismiss" onClick={this.onDismissError}>×</a>
                              <span>
                                  <span className="icon icon-warning"></span>{this.getMessageText(this.state.postMessage)}
                              </span>
                          </div>
                      </div> :
                      null
                    }
                    <div className="post-actions">
                        {this.state.userName ? null :
                          <div className="not-logged-in" style={{
                            color: 'rgb(63, 69, 73)',
                            padding: '11px 0 0 10px',
                            'font-family': "'Helvetica Neue', arial, sans-serif",
                            'font-size': '12px'
                          }}>
                            <a onClick={this.onLogin}>Login to Reddit</a> to post a comment
                          </div>
                        }
                        <div className="logged-in">
                            <section>
                                <div className="temp-post" style={{textAlign: 'right'}}>
                                    <button className={buttonClasses} type="button" onClick={this.onSubmit}>
                                        {this.state.submitPending ? 'Submitting...' : <span>Post as {this.state.userName}</span>}
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
                              Comments managed by
                              <a href="https://github.com/salsita/supercomments/" target="_blank"> Supercomments&trade; </a>
                              and hosted on <a href="http://www.reddit.com" target="_blank">Reddit&reg;&nbsp;</a>
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

  onLogin: function() {
    this.getFlux().actions.login();
  },

  onChange: function(e) {
    this.getFlux().actions.itemChanged({ comment: this.props.comment, newState: { replyBody: e.target.value }});
  },

  onFormClicked: function() {
    this.getFlux().actions.itemChanged({ comment: this.props.comment, newState: { formExpanded: true }});
    this.refs.textarea.getDOMNode().focus();
  },

  onSubmit: function(e) {
    e.target.blur();
    e.stopPropagation();
    if (!this.state.submitPending) {
      this.getFlux().actions.submitComment({
        parent: this.props.comment,
        body: this.state.replyBody
      });
    }
  },

  onDismissError: function() {
    this.getFlux().actions.itemChanged({ comment: this.props.comment, newState: { postMessage: null }});
  },

  onRedditSubmissionPageOpened: function() {
    this.getFlux().actions.itemChanged({
      comment: this.props.comment,
      newState: { postMessage: FormMessages.REDDIT_SUBMISSION_PENDING }
    });
  }
});

module.exports = CommentForm;