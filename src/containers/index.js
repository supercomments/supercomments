import React, { PropTypes } from 'react';
import { Provider } from 'react-redux';

import Thread from 'containers/Thread';
import Header from 'containers/Header';
import { ROOT_THREAD_ID } from 'selectors/threadSelectors';

const Root = ({ store }) => (
  <Provider store={store}>
    <div id="layout">
      <Header />
      <Thread threadId={ROOT_THREAD_ID} />
    </div>
  </Provider>
);

Root.propTypes = {
  store: PropTypes.object.isRequired
};

export default Root;
