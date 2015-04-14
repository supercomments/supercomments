var React = require('react/addons');
var classNames = require('classnames');
var autosize = require('autosize');
var Fluxxor = require('fluxxor');

var FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

var CommentForm = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin('RedditStore')],

  getInitialState: function() {
    return {
      formExpanded: this.props.expanded,
      name: '',
      email: '',
      password: '',
      formErrors: { name: false, email: false, password: false}
    };
  },

  getStateFromFlux: function() {
    var state = this.getFlux().store('RedditStore').getState();
    return state;  
  },

  componentDidMount: function() {
    autosize($(React.findDOMNode(this)).find('.textarea'));
  },

  render: function() {
    var formClasses = classNames({
      reply: this.props.parent,
      expanded: this.state.formExpanded,
      authenticated: this.state.userName
    });
    var placeholder = this.state.formExpanded ? '' : <span className="placeholder">Join the discussion…</span>;
    var postAlertStyle = this.state.postErrorText ? {} : { display: 'none' };

    return (
        <form className={formClasses}>
            <div className="postbox">
                <div role="alert"></div>
                <div className="avatar">
                    <span className="user">
                        <img src="//a.disquscdn.com/next/embed/assets/img/noavatar92.b677f9ddbee6f4bb22f473ae3bd61b85.png" alt="Avatar"/>
                    </span>
                </div>

                <div className="textarea-wrapper" onClick={this.onFormClicked}>
                    <div>{placeholder}
                        <textarea className="textarea" tabIndex="0" role="textbox" aria-multiline="true" aria-label="Join the discussion…" style={{overflow: 'hidden'}} />
                        <div style={{display: 'none'}}>
                            <ul className="suggestions">
                                <li className="header">
                                    <h5>in this conversation</h5>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="edit-alert" style={postAlertStyle}>
                        <div className="alert error">
                            <a className="close" title="Dismiss" onClick={this.onDismissError}>×</a>
                            <span>
                                <span className="icon icon-warning"></span>{this.state.postErrorText}
                            </span>
                        </div>
                    </div>
                    <div className="post-actions">
                        <div className="logged-in">
                            <section>
                                <div className="temp-post" style={{textAlign: 'right'}}>
                                    <button className="btn" onClick={this.onSubmit}>
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
                                    <li><span>By creating an account, you agree to reddit&apos;s <a href="http://www.reddit.com/help/useragreement">User Agreement</a> and <a href="http://www.reddit.com/help/privacypolicy">Privacy Policy</a>.</span>
                                    </li>
                                    <li><span>We&apos;re proud of them, and you should read them.</span>
                                    </li>
                                </ul>
                                <p className="clearfix"><a href="http://www.reddit.com/help/useragreement" className="btn btn-small" target="_blank">Read full terms and conditions</a>
                                </p>
                            </div>
                        </div>
                      </div>                  
                    </section>
                </div>
            </div>
        </form>
    );
  },

  onFormClicked: function(e) {
    this.setState({ formExpanded: true });
    var form = $(e.target).closest('form');
    form.find('.textarea').focus();
  },

  onSubmit: function(e) {
    e.preventDefault();
    e.stopPropagation();
    var textarea = $(e.target).closest('.textarea-wrapper').find('.textarea');
    var body = textarea.val();
    if (this.validateForm(body)) {
      this.getFlux().actions.submitComment({
        body : body,
        parent : this.props.parent || this.state.post
      });
      textarea.val('');
      textarea.blur();
      if (this.props.onSubmit) {
        this.props.onSubmit();
      }
    }
  },

  onLogin: function() {
    this.getFlux().actions.login();
  },

  onDismissError: function() {
    this.setState({ postErrorText: null });
  },

  validateForm: function(body) {
    if (!this.state.post) {
      var submitUrl = 'http://www.reddit.com/submit?url=' + encodeURI(this.state.url);
      this.setState({ postErrorText: 
        <span>You must <a href={submitUrl} target="_blank">submit this post to Reddit</a> before commenting.</span>
      });
      return false;
    }
    else if (!body) {
      this.setState({ postErrorText: 'Comments can\'t be blank.' });
      return false;
    }
    else {
      this.setState({ postErrorText: null });
      return true;
    }
  }
});

module.exports = CommentForm;