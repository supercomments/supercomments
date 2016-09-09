import React, { PropTypes } from 'react';

import UserLogin from 'containers/UserLogin';

const PrimaryHeader = ({ commentsCount, subreddit }) => (
  <header id="main-nav">
    <nav className="nav nav-primary">
      <ul>
        <li className="nav-tab nav-tab--primary tab-conversation">
          <a className="publisher-nav-color">
            <span className="comment-count">
              {commentsCount} {commentsCount === 1 ? 'comments' : 'comments'}
            </span>
          </a>
        </li>
        <li className="nav-tab nav-tab--primary tab-community">
          <a
            href={subreddit ? `https://reddit.com/${subreddit}` : '#'}
            id="community-tab"
            className="publisher-nav-color"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="community-name"><strong>{subreddit}</strong></span>
          </a>
        </li>
        <UserLogin />
      </ul>
    </nav>
  </header>
);

PrimaryHeader.propTypes = {
  commentsCount: PropTypes.number.isRequired,
  subreddit: PropTypes.string.isRequired
};

export default PrimaryHeader;
