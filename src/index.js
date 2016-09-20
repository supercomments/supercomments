import React from 'react';
import ReactDOM from 'react-dom';
import Supercomments from './Supercomments';

ReactDOM.render(
  <Supercomments
    url="http://blog.javascripting.com/2016/05/21/the-problem-with-redux-and-how-to-fix-it"
    disqus={{
      shortName: 'javascripting',
      identifier: '82'
    }}
  />,
  document.getElementById('root')
);
