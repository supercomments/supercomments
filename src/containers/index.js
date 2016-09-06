import React, { PropTypes } from 'react';
import { Provider } from 'react-redux';

import Thread from 'containers/Thread';
import { ROOT_THREAD_ID } from 'selectors/threadSelectors';

const Root = ({ store }) => (
  <Provider store={store}>
    <Thread threadId={ROOT_THREAD_ID} />
  </Provider>
);

Root.propTypes = {
  store: PropTypes.object.isRequired
};

export default Root;
