import { createSelector } from 'reselect';

// Gets the appropriate slice in the global app state
const getThrobber = appState => appState.throbber;

// Gets information whether loading is in progress
export const isLoading = createSelector(
  getThrobber,
  throbber => throbber.loading
);
