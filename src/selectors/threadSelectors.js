import { createSelector } from 'reselect';

export const ROOT_THREAD_ID = 'rootThread';

// Gets the appropriate slice in the global app state
const getThread = appState => appState.thread;

export const isRootThread = threadId => threadId === ROOT_THREAD_ID;

// Gets replies for root thread
export const getRootThreadReplies = createSelector(
  getThread,
  thread => thread.rootComments
);

// Get Reply Form instance state slice
export const getReplyForm = createSelector(
  getThread,
  (appState, threadId) => threadId,
  (thread, threadId) => thread.replyForms[threadId]
);
