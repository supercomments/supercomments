import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import buildActionCreators from 'helpers/buildActionCreators';
import * as Actions from 'constants/actions';
import {
  mapReplies,
  mapComments
} from 'selectors/entityRepositorySelectors';

import {
  getRootThreadReplies,
  isRootThread
} from 'selectors/threadSelectors';

import ThreadWrapper from 'components/ThreadWrapper';
import Comment from 'components/Comment';

const NonConnectedThread = ({ comments, rootThread, onClickReply }) => (
  <ThreadWrapper isRootThread={rootThread}>
    {comments.map(comment => (
      <Comment
        onClickReply={() => onClickReply(comment.id)}
        key={comment.id}
        {...comment}
      />
    ))}
  </ThreadWrapper>
);

NonConnectedThread.propTypes = {
  comments: PropTypes.array.isRequired,
  rootThread: PropTypes.bool.isRequired,
  onClickReply: PropTypes.func.isRequired
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

const Thread = connect(
  mapStateToProps,
  buildActionCreators({
    onClickReply: Actions.Reply
  })
)(NonConnectedThread);

Thread.propTypes = {
  threadId: PropTypes.string.isRequired
};

export default Thread;
