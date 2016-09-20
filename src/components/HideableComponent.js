import React, { PropTypes } from 'react';

const HideableComponent = ({ visible, children }) => (
  <div style={{ display: visible ? 'block' : 'none' }}>
    {children}
  </div>
);

HideableComponent.propTypes = {
  visible: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired
};

export default HideableComponent;
