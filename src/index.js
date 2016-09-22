import React from 'react';
import ReactDOM from 'react-dom';
import Supercomments from './Supercomments';

ReactDOM.render(
  <Supercomments
    url={window.supercommentsConfig.url}
    disqus={window.supercommentsConfig.disqus}
    reddit={window.supercommentsConfig.reddit}
  />,
  document.getElementById('supercomments')
);
