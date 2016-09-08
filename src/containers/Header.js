import React from 'react';

import UserLogin from 'containers/UserLogin';

const Header = () => (
  <header id="main-nav">
    <nav className="nav nav-primary">
      <ul>
        <li className="nav-tab nav-tab--primary tab-conversation">
          <a className="publisher-nav-color">
            <span className="comment-count">7 comments</span>
          </a>
        </li>
        <li className="nav-tab nav-tab--primary tab-community">
          <a className="publisher-nav-color" id="community-tab">
            <span className="community-name"><strong>Community Name</strong></span>
          </a>
        </li>
        <UserLogin />
      </ul>
    </nav>
  </header>
);

export default Header;
