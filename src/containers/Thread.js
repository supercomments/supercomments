import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import {
  mapReplies,
  mapComments
} from 'selectors/entityRepositorySelectors';
import { getRootThreadReplies } from 'selectors/threadSelectors';

const NonConnectedThread = ({ comments }) => (
  <ul>
    {comments.map(({ author, id }) => (
      <li key={id}>{author}
        <Thread threadId={id} />
      </li>
    ))}
  </ul>
);

NonConnectedThread.propTypes = {
  comments: PropTypes.array.isRequired
};

const mapStateToProps = (appState, ownProps) => {
  const {
    threadId
  } = ownProps;

  return {
    comments: threadId ?
      mapReplies(appState, threadId) :
      mapComments(appState, getRootThreadReplies(appState))
  };
};

const Thread = connect(mapStateToProps)(NonConnectedThread);
export default Thread;
