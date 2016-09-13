import { createSelector } from 'reselect';

import * as Entities from 'constants/entities';
import { getRedditId } from 'selectors/setupSelectors';

// Gets the appropriate slice in the global app state
export const getEntityRepository = appState => appState.entityRepository;

// Gets list of Comments
const getComments = createSelector(
  getEntityRepository,
  entityRepository => entityRepository[Entities.Comment]
);

// Gets number of comments
export const getCommentsCount = createSelector(
  getComments,
  comments => Object.keys(comments).length
);

// Gets comment by id
export const getComment = createSelector(
  getComments,
  (state, commentId) => commentId,
  (comments, commentId) => comments[commentId]
);

// Gets post (there's just one post in the app, which is defined while setting up the app)
export const getPost = createSelector(
  getEntityRepository,
  getRedditId,
  (entityRepository, redditId) => entityRepository.Post[redditId]
);


// Maps list of replies for corresponding Thread ID
export const mapPostReplies = createSelector(
  getPost,
  getComments,
  (post, comments) => post.comments.map(commentId => comments[commentId])
);

// Maps list of replies for corresponding Thread ID
export const mapCommentReplies = createSelector(
  getComments,
  (state, threadId) => threadId,
  (comments, threadId) => comments[threadId].replies.map(commentId => comments[commentId])
);

// Gets thread by threadId, thread might be either Comment or Post (root thread)
export const getThread = createSelector(
  getPost,
  getComments,
  (state, threadId) => threadId,
  (post, comments, threadId) => {
    if (post.id === threadId) {
      return post;
    } else {
      return comments[threadId];
    }
  }
);
