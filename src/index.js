import React from 'react';
import { render } from 'react-dom';

import configureStore from './store';

const store = configureStore();

const doRender = () => {
  const Root = require('./containers').default;

  render(
    <Root store={store} />,
    document.getElementById('root')
  );
};

doRender();

if (module.hot) {
  module.hot.accept('./containers', doRender);
}
