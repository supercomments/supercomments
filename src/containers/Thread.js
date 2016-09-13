import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import buildActionCreators from 'helpers/buildActionCreators';
import * as Actions from 'constants/actions';
import { getComment, mapCommentReplies, mapPostReplies } from 'selectors/entityRepositorySelectors';
import { isAuthenticated } from 'selectors/authenticationSelectors';

import ThreadWrapper from 'components/ThreadWrapper';
import Comment from 'components/Comment';

const NonConnectedThread = ({
  author,
  comments,
  isRootThread,
  onClickReply,
  onToggleUpvote,
  onToggleDownvote
}) => (
  <ThreadWrapper isRootThread={isRootThread}>
    {comments.map(comment => (
      <Comment
        onClickReply={() => onClickReply(comment.id)}
        onToggleUpvote={() => onToggleUpvote(comment.id)}
        onToggleDownvote={() => onToggleDownvote(comment.id)}
        key={comment.id}
        parentAuthor={author}
        {...comment}
      />
    ))}
  </ThreadWrapper>
);

NonConnectedThread.propTypes = {
  author: PropTypes.string,
  comments: PropTypes.array.isRequired,
  isRootThread: PropTypes.bool.isRequired,
  onClickReply: PropTypes.func.isRequired,
  onToggleUpvote: PropTypes.func.isRequired,
  onToggleDownvote: PropTypes.func.isRequired
};

const mapStateToProps = (appState, { isRootThread, threadId }) => {
  const authenticated = isAuthenticated(appState);

  if (isRootThread) {
    return {
      authenticated,
      author: '',
      comments: mapPostReplies(appState, threadId)
    };
  } else {
    return {
      authenticated,
      author: getComment(appState, threadId).author,
      comments: mapCommentReplies(appState, threadId)
    };
  }
};

const Thread = connect(
  mapStateToProps,
  buildActionCreators({
    onClickReply: Actions.Reply,
    onToggleUpvote: Actions.ToggleUpvote,
    onToggleDownvote: Actions.ToggleDownvote,
    login: Actions.LogIn
  }),
  (stateProps, dispatchProps, ownProps) => ({
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
    onToggleDownvote: commentId => {
      if (stateProps.authenticated) {
        dispatchProps.onToggleDownvote(commentId);
      } else {
        dispatchProps.login();
      }
    },
    onToggleUpvote: commentId => {
      if (stateProps.authenticated) {
        dispatchProps.onToggleUpvote(commentId);
      } else {
        dispatchProps.login();
      }
    }
  })
)(NonConnectedThread);

Thread.propTypes = {
  threadId: PropTypes.string.isRequired,
  isRootThread: PropTypes.bool.isRequired
};

export default Thread;
