import { createSelector } from 'reselect';

import { isRootThread, getPost } from 'selectors/threadSelectors';

// Gets the appropriate slice in the global app state
export const getEntityRepository = appState => appState.entityRepository;

// Gets list of Comments
const getComments = createSelector(
  getEntityRepository,
  entityRepository => entityRepository.comments
);

// Maps list of Comment IDs to Comments
export const mapComments = createSelector(
  getComments,
  (state, commentIds) => commentIds,
  (comments, commentIds) => commentIds.map(commentId => comments[commentId])
);

// Maps list of replies for corresponding Thread ID
export const mapReplies = createSelector(
  getComments,
  (state, threadId) => threadId,
  (comments, threadId) => comments[threadId].replies.map(commentId => comments[commentId])
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


// Gets thingId by threadId, may return thingId of post it's is provided
// otherwise thingId of the comment is returned
export const getThingId = createSelector(
  getComments,
  getPost,
  (state, threadId) => threadId,
  (comments, post, threadId) => {
    if (isRootThread(threadId)) {
      return post.thingId;
    } else {
      return comments[threadId].thingId;
    }
  }
);
