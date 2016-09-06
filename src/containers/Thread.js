import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import {
  mapReplies,
  mapComments
} from 'selectors/entityRepositorySelectors';
import { getRootThreadReplies } from 'selectors/threadSelectors';
import ThreadWrapper from 'components/ThreadWrapper';
import Comment from 'components/Comment';

const NonConnectedThread = ({ comments, isRootThread }) => (
  <ThreadWrapper isRootThread={isRootThread}>
    {comments.map(comment => (
      <Comment
        key={comment.id}
        {...comment}
      >
        <Thread threadId={comment.id} />
      </Comment>
    ))}
  </ThreadWrapper>
);

NonConnectedThread.propTypes = {
  comments: PropTypes.array.isRequired,
  isRootThread: PropTypes.bool.isRequired
};

const mapStateToProps = (appState, ownProps) => {
  const {
    threadId
  } = ownProps;

  const isRootThread = !threadId;

  return {
    comments: !isRootThread ?
      mapReplies(appState, threadId) :
      mapComments(appState, getRootThreadReplies(appState)),
    isRootThread
  };
};

const Thread = connect(mapStateToProps)(NonConnectedThread);
export default Thread;
