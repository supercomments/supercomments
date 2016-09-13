import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import Dropdown from 'components/Dropdown';
import * as Actions from 'constants/actions';
import buildActionCreators from 'helpers/buildActionCreators';
import { isAuthenticated, getAuthenticatedUser } from 'selectors/authenticationSelectors';

const UserLogin = ({
  authenticated,
  user,
  logOut,
  logIn
}) => {
  if (authenticated) {
    return (
      <Dropdown
        title={user}
        className="nav-tab nav-tab--primary dropdown user-menu"
      >
        <li>
          <a href={`https://www.reddit.com/user/${user}`} target="_blank" rel="noopener noreferrer">Your Profile</a>
          <a href="https://www.reddit.com/prefs" target="_blank" rel="noopener noreferrer">Edit Settings</a>
          <a href="https://www.reddit.com/wiki/faq" target="_blank" rel="noopener noreferrer">Help</a>
          <a onClick={logOut}>Logout</a>
        </li>
      </Dropdown>
    );
  } else {
    return (
      <li className="nav-tab nav-tab--primary user-menu">
        <a onClick={logIn}>Login</a>
      </li>
    );
  }
};

UserLogin.propTypes = {
  authenticated: PropTypes.bool.isRequired,
  user: PropTypes.string,
  logOut: PropTypes.func.isRequired,
  logIn: PropTypes.func.isRequired
};

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
