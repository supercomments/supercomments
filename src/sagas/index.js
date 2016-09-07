import { takeEvery } from 'redux-saga';
import { fork } from 'redux-saga/effects';

import * as Actions from 'constants/actions';
import { fetchComments } from 'sagas/threadSaga';
import { login } from 'sagas/authenticationSaga';

export default function* () {
  yield [
    fork(fetchComments),
    fork(takeEvery, Actions.LogIn, login)
  ];
}
