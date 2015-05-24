let React = require('react');
let Fluxxor = require('fluxxor');

let FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

let CommentsUser = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin('RedditStore')],

  getStateFromFlux() {
    return this.getFlux().store("RedditStore").getState();
  },

  render() {
    if (this.state.userName) {
      return this.renderLoggedIn();
    }
    else {
      return this.renderLoggedOut();
    }
  },

  renderLoggedIn() {
    return (
      <li className="dropdown user-menu"  >
          <a className="dropdown-toggle" data-toggle="dropdown">
              <span className="dropdown-toggle-wrapper">

              <span className="avatar">
                  <img alt="Avatar"/>
              </span>
              <span className="username">{this.state.userName}</span>
              </span> <span className="caret"></span>
          </a>
          <ul className="dropdown-menu">
              <li>
                  <a href={this.state.profileUrl} target="_blank">
                      Your Profile
                  </a>
              </li>
              <li>
                  <a href="https://www.reddit.com/prefs/" target="_blank">Edit Settings</a>
              </li>
              <li>
                  <a href="https://www.reddit.com/wiki/faq" target="_blank">Help</a>
              </li>
              <li>
                  <a onClick={this.onLogout}>Logout</a>
              </li>
          </ul>
      </li>
    );
  },

  renderLoggedOut() {
    return (
      <li className="dropdown user-menu" >
        {this.state.loggingIn ?
          <a className="dropdown-toggle" style={{opacity: '20%'}}>Logging In</a> :
          <a className="dropdown-toggle" onClick={this.onLogin}>Login</a>
        }
      </li>
    );
  },


  onLogin() {
    this.getFlux().actions.login();
  },

  onLogout() {
    this.getFlux().actions.logout();
  }
});

module.exports = CommentsUser;