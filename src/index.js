import React from 'react';
import { render } from 'react-dom';

import * as Actions from 'constants/actions';
import buildAction from 'helpers/buildAction';
import configureStore from './store';

const store = configureStore();

store.dispatch(buildAction(Actions.Setup, {
  id: '52jtld'
}));

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
