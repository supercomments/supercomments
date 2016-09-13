import { takeEvery } from 'redux-saga';
import { fork } from 'redux-saga/effects';

import * as Actions from 'constants/actions';
import {
  onLogin,
  restoreSession,
  onLoggedIn
} from 'sagas/authenticationSaga';
import { fetchComments, onSubmit } from 'sagas/threadSaga';

export default function* () {
  yield [
    fork(takeEvery, Actions.Setup, restoreSession),
    fork(takeEvery, Actions.Setup, fetchComments),
    fork(takeEvery, Actions.LoggedIn, onLoggedIn),
    fork(takeEvery, Actions.LogIn, onLogin),
    fork(takeEvery, Actions.Sort, fetchComments),
    fork(takeEvery, Actions.SubmitReply, onSubmit)
  ];
}
