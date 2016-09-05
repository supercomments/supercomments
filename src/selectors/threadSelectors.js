import { createSelector } from 'reselect';

// Gets the appropriate slice in the global app state
const getThread = appState => appState.thread;

// Gets replies for root thread
export const getRootThreadReplies = createSelector(
  getThread,
  thread => thread.comments
);
