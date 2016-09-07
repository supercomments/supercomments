import { put, call } from 'redux-saga/effects';

import buildAction from 'helpers/buildAction';
import * as Actions from 'constants/actions';
import { RedditAuthenticated } from 'constants/windowMessageTypes';
import { getAuthUrl, authenticate } from 'effects/redditAPI';
import { openWindowAndWaitForMessage } from 'effects/windowEffects';
import { withThrobber } from 'sagas/throbberSaga';

const AUTH_WINDOW_WIDTH = 1024;
const AUTH_WINDOW_HEIGHT = 800;
const AUTH_WINDOW_TITLE = 'Reddit Auth';

export function* login() {
  const csrf = Math.random().toString();
  const authUrl = yield call(getAuthUrl, csrf);

  const {
    token,
    state
  } = yield call(
    openWindowAndWaitForMessage,
    AUTH_WINDOW_TITLE,
    authUrl,
    {
      width: AUTH_WINDOW_WIDTH,
      height: AUTH_WINDOW_HEIGHT
    },
    RedditAuthenticated
  );

  if (csrf === state) {
    yield* withThrobber(function* () {
      const { name } = yield call(authenticate, token);

      yield put(buildAction(Actions.LoggedIn, name));
    });
  }
}
