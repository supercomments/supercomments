import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import buildActionCreators from 'helpers/buildActionCreators';
import * as Actions from 'constants/actions';
import { mapReplies } from 'selectors/entityRepositorySelectors';

import ThreadWrapper from 'components/ThreadWrapper';
import Comment from 'components/Comment';

const NonConnectedThread = ({ comments, isRootThread, onClickReply }) => (
  <ThreadWrapper isRootThread={isRootThread}>
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
  isRootThread: PropTypes.bool.isRequired,
  onClickReply: PropTypes.func.isRequired
};

const mapStateToProps = (appState, { threadId }) => ({
  comments: mapReplies(appState, threadId)
});

const Thread = connect(
  mapStateToProps,
  buildActionCreators({
    onClickReply: Actions.Reply
  })
)(NonConnectedThread);

Thread.propTypes = {
  threadId: PropTypes.string.isRequired,
  isRootThread: PropTypes.bool.isRequired
};

export default Thread;
