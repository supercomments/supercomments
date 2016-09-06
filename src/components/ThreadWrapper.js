import React, { PropTypes } from 'react';

const ThreadWrapper = ({ children, isRootThread }) => {
  if (isRootThread) {
    return (
      <ul id="post-list" className="post-list">
        {children}
      </ul>
    );
  } else {
    return (
      <ul data-role="children" className="children">
        {children}
      </ul>
    );
  }
};

ThreadWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  isRootThread: PropTypes.bool.isRequired
};

export default ThreadWrapper;
