import React, { PropTypes } from 'react';

const LayoutWrapper = ({ children }) => (
  <div id="layout">
    {children}
  </div>
);

LayoutWrapper.propTypes = {
  children: PropTypes.node.isRequired,
};

export default LayoutWrapper;
