var React = require('react/addons');
var classNames = require('classnames');
var Fluxxor = require('fluxxor');
var Textarea = require('react-textarea-autosize');

var FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

const AVATAR_URL = "//a.disquscdn.com/next/embed/assets/img/noavatar92.b677f9ddbee6f4bb22f473ae3bd61b85.png";

var CommentForm = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin('RedditStore')],

  componentDidMount: function() {
    if (this.props.expanded) {
      React.findDOMNode(this.refs.textarea).focus();
    }
  },

  getInitialState: function() {
    return {
      body: '',
      formExpanded: this.props.expanded
    };
  },

  getStateFromFlux: function() {
    return this.getFlux().store('RedditStore').getState();
  },

  render: function() {
    var formClasses = classNames({
      reply: !!this.props.item,
      expanded: this.state.formExpanded,
      authenticated: this.state.userName
    });

    return (
        <form className={formClasses}>
            <div className="postbox">
                <div role="alert"></div>
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
                          value={this.state.body}
                          onChange={this.onChange} />
                        <div style={{display: 'none'}}>
                            <ul className="suggestions">
                                <li className="header">
                                    <h5>in this conversation</h5>
                                </li>
                            </ul>
                        </div>
                    </div>
                    {this.state.postErrorText ?
                      <div className="edit-alert">
                          <div className="alert error">
                              <a className="close" title="Dismiss" onClick={this.onDismissError}>×</a>
                              <span>
                                  <span className="icon icon-warning"></span>{this.state.postErrorText}
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
                {!this.props.item ?
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
                        </div>                  
                      </section>
                  </div> :
                  null
                }
            </div>
        </form>
    );
  },

  onChange: function(e) {
    this.setState({ body: e.target.value });    
  },

  onFormClicked: function() {
    this.setState({ formExpanded: true });
    React.findDOMNode(this.refs.textarea).focus();
  },

  onSubmit: function() {
    if (this.validateForm(this.state.body)) {
      this.getFlux().actions.submitComment({
        body : this.state.body,
        parent : (this.props.item ? this.props.item.props.comment : null) || this.state.post
      });
      this.setState({ body: '' });
      if (this.props.item) {
        this.getFlux().actions.itemChanged({ item: this.props.item, newState: { replyFormVisible: false }});
      }
    }
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