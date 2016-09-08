import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import * as Actions from 'constants/actions';
import buildActionCreators from 'helpers/buildActionCreators';
import { isAuthenticated, getAuthenticatedUser } from 'selectors/authenticationSelectors';

class UserLogin extends Component {

  static propTypes = {
    authenticated: PropTypes.bool.isRequired,
    logOut: PropTypes.func.isRequired,
    logIn: PropTypes.func.isRequired,
    user: PropTypes.string
  }

  constructor(props) {
    super(props);
    this.state = {
      toggled: false
    };
    this.boundToggleDropdown = this.toggleDropdown.bind(this);
  }

  toggleDropdown() {
    this.setState({
      open: !this.state.open
    });
  }

  render() {
    const { authenticated, user, logOut, logIn } = this.props;
    const { open } = this.state;

    if (authenticated) {
      return (
        <li className={`nav-tab nav-tab--primary dropdown user-menu ${open ? 'open' : ''}`}>
          <a className="dropdown-toggle" onClick={this.boundToggleDropdown}>
            <span className="dropdown-toggle-wrapper">
              <span className="username">{user}</span>
              <span className="caret" />
            </span>
          </a>
          <ul className="dropdown-menu">
            <li>
              <a onClick={logOut}>Logout</a>
            </li>
          </ul>
        </li>
      );
    } else {
      return (
        <li className="nav-tab nav-tab--primary user-menu">
          <a onClick={logIn}>Login</a>
        </li>
      );
    }
  }
}

const mapStateToProps = appState => {
  const authenticated = isAuthenticated(appState);
  const user = getAuthenticatedUser(appState);

  return {
    authenticated,
    user
  };
};

export default connect(
  mapStateToProps,
  buildActionCreators({
    logOut: Actions.LogOutRequest,
    logIn: Actions.LogIn
  })
)(UserLogin);
