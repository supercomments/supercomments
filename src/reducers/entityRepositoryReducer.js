import { merge } from 'lodash';
import moment from 'moment';

import * as Actions from 'constants/actions';
import { isRootThread } from 'selectors/threadSelectors';

const initialState = {
  comments: {}
};

export default (state = initialState, { type, payload }) => {
  switch (type) {
    case Actions.EntitiesHaveChanged:
      return merge({}, state, payload);

    case Actions.CreateTransientComment: {
      const {
        transientId,
        threadId,
        text,
        author
      } = payload;

      const parentComment = state.comments[threadId];

      const newComment = {
        id: transientId,
        thingId: null,
        parentAuthor: parentComment.author,
        author,
        body: text,
        score: 1,
        created: moment(),
        replies: []
      };

      const comments = {
        ...state.comments,
        [parentComment.id]: {
          ...parentComment,
          replies: [
            ...parentComment.replies,
            transientId
          ]
        }
      };

      comments[transientId] = newComment;

      return {
        ...state,
        comments
      };
    }

    case Actions.RemoveTransientComment: {
      const {
        transientId,
        threadId
      } = payload;

      const comments = {
        ...state.comments,
        [threadId]: {
          ...state.comments[threadId],
          replies: state
            .comments[threadId]
            .replies.filter(replyId => replyId !== transientId)
        }
      };
      delete comments[transientId];

      return {
        ...state,
        comments
      };
    }

    case Actions.CreateComment: {
      const {
        commentId,
        threadId
      } = payload;

      if (isRootThread(threadId)) {
        return state;
      } else {
        const comments = {
          ...state.comments,
          [threadId]: {
            ...state.comments[threadId],
            replies: [...state.comments[threadId].replies, commentId]
          }
        };

        return {
          ...state,
          comments
        };
      }
    }

    default:
      return state;
  }
};
