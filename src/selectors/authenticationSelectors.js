import { createSelector } from 'reselect';

// Gets the appropriate slice in the global app state
export const getAuthentication = appState => appState.authentication;

// Determines whether user is authenticated
export const isAuthenticated = createSelector(
  getAuthentication,
  authentication => authentication.user !== null
);

// Gets currently authenticated user
export const getAuthenticatedUser = createSelector(
  getAuthentication,
  authentication => authentication.user
);
