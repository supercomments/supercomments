import { race, take, put, call } from 'redux-saga/effects';
import moment from 'moment';

import buildAction from 'helpers/buildAction';
import * as Actions from 'constants/actions';
import { RedditAuthenticated } from 'constants/windowMessageTypes';
import { getAuthUrl, authenticate, tokenExpiration, logout } from 'effects/redditAPI';
import {
  openWindowAndWaitForMessage,
  saveToLocalStorage,
  restoreFromLocalStorage } from 'effects/windowEffects';
import { withThrobber } from 'sagas/throbberSaga';

const AUTH_WINDOW_WIDTH = 1024;
const AUTH_WINDOW_HEIGHT = 800;
const AUTH_WINDOW_TITLE = 'Reddit Auth';

function* clearRedditAuthInLocalStorage() {
  yield call(saveToLocalStorage, {
    reddit: null
  });
}

const isTokenExpired = expires => moment() > moment(expires);

export function* restoreSession() {
  const data = yield call(restoreFromLocalStorage);

  if (data && data.reddit && data.reddit.token) {
    const {
      reddit: {
        name,
        token,
        expires
      }
    } = data;

    // If the stored auth token (local storage) has not expired
    // yet, we can just authenticate using stored
    // token and save the user in app state
    if (!isTokenExpired(expires)) {
      try {
        // Just put the user in the App state
        yield put(buildAction(Actions.LoggedIn, name));

        // re-authenticate reddit API
        yield call(authenticate, token);
      } catch (ex) {
        console.warn(
          'Could not re-authenticate reddit API using ' +
          'stored OAuth token from localStorage'
        );

        yield* clearRedditAuthInLocalStorage();
        yield put(buildAction(Actions.LogOut));
      }
    }
  }
}

export function* onLogin() {
  const csrf = Math.random().toString();
  const authUrl = yield call(getAuthUrl, csrf);

  const {
    token,
    state,
    expires
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

      yield call(saveToLocalStorage, {
        reddit: {
          name,
          token,
          expires: moment().add(expires, 'seconds')
        }
      });

      // TODO: ask Matt, should re-fetch list?
    });
  }
}

export function* onLoggedIn() {
  const {
    logOutRequest
  } = yield race({
    expired: call(tokenExpiration),
    logOutRequest: take(Actions.LogOutRequest)
  });

  yield put(buildAction(Actions.LogOut));

  if (logOutRequest) {
    yield call(logout);
  }

  yield* clearRedditAuthInLocalStorage();
}
