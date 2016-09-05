import React, { PropTypes } from 'react';
import { Provider } from 'react-redux';

import Thread from 'containers/Thread';

const Root = ({ store }) => (
  <Provider store={store}>
    <Thread />
  </Provider>
);

Root.propTypes = {
  store: PropTypes.object.isRequired
};

export default Root;
