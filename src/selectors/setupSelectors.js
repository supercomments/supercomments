import { createSelector } from 'reselect';

// Gets the appropriate slice in the global app state
const getSetup = appState => appState.setup;

// Gets ID of reddit thread provided while in setup phase
export const getRedditId = createSelector(
  getSetup,
  setup => setup.id
);

