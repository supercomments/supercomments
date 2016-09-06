import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import {
  mapReplies,
  mapComments
} from 'selectors/entityRepositorySelectors';

import {
  getRootThreadReplies,
  isRootThread
} from 'selectors/threadSelectors';

import ReplyForm from 'containers/ReplyForm';

import ThreadWrapper from 'components/ThreadWrapper';
import Comment from 'components/Comment';

const NonConnectedThread = ({ comments, rootThread }) => (
  <ThreadWrapper isRootThread={rootThread}>
    {comments.map(comment => (
      <Comment
        key={comment.id}
        {...comment}
      >{() => ({
        Thread: () => <Thread threadId={comment.id} />,
        ReplyForm: () => <ReplyForm threadId={comment.id} />
      })}
      </Comment>
    ))}
  </ThreadWrapper>
);

NonConnectedThread.propTypes = {
  comments: PropTypes.array.isRequired,
  rootThread: PropTypes.bool.isRequired
};

const mapStateToProps = (appState, { threadId }) => {
  const rootThread = isRootThread(threadId);

  return {
    comments: !rootThread ?
      mapReplies(appState, threadId) :
      mapComments(appState, getRootThreadReplies(appState)),
    rootThread
  };
};

const Thread = connect(mapStateToProps)(NonConnectedThread);

Thread.propTypes = {
  threadId: PropTypes.string.isRequired
};

export default Thread;
