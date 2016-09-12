import { createSelector } from 'reselect';
import { find } from 'lodash';

import * as Entities from 'constants/entities';

// Gets the appropriate slice in the global app state
export const getEntityRepository = appState => appState.entityRepository;

// Gets list of Comments
const getComments = createSelector(
  getEntityRepository,
  entityRepository => entityRepository[Entities.Comment]
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

// Gets root thread
export const getRootThread = createSelector(
  getComments,
  comments => find(comments, comment => !!comment.root)
);
