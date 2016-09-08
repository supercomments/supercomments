import { takeEvery } from 'redux-saga';
import { fork } from 'redux-saga/effects';

import * as Actions from 'constants/actions';
import { onLogin, restoreSession, subscribeForTokenExpiration } from 'sagas/authenticationSaga';
import { fetchComments } from 'sagas/threadSaga';

export default function* () {
  yield [
    fork(subscribeForTokenExpiration),
    fork(restoreSession),
    fork(fetchComments),
    fork(takeEvery, Actions.LogIn, onLogin)
  ];
}
