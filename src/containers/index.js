import React, { PropTypes } from 'react';
import { Provider } from 'react-redux';

import RedditSupercomments from 'containers/RedditSupercomments';

const Root = ({ store }) => (
  <Provider store={store}>
    <RedditSupercomments />
  </Provider>
);

Root.propTypes = {
  store: PropTypes.object.isRequired
};

export default Root;
