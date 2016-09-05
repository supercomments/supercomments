import { createSelector } from 'reselect';

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
