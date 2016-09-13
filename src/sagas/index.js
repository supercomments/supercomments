import { takeEvery } from 'redux-saga';
import { fork } from 'redux-saga/effects';

import * as Actions from 'constants/actions';
import {
  onLogin,
  restoreSession,
  onLoggedIn
} from 'sagas/authenticationSaga';
import {
  fetchCommentsWithThrobber,
  onSubmit,
  onToggleUpvotePost,
  onToggleUpvote,
  onToggleDownvote
} from 'sagas/threadSaga';

export default function* () {
  yield [
    fork(takeEvery, Actions.Setup, restoreSession),
    fork(takeEvery, Actions.Setup, fetchCommentsWithThrobber),
    fork(takeEvery, Actions.LoggedIn, onLoggedIn),
    fork(takeEvery, Actions.LogIn, onLogin),
    fork(takeEvery, Actions.Sort, fetchCommentsWithThrobber),
    fork(takeEvery, Actions.SubmitReply, onSubmit),
    fork(takeEvery, Actions.ToggleUpvotePost, onToggleUpvotePost),
    fork(takeEvery, Actions.ToggleUpvote, onToggleUpvote),
    fork(takeEvery, Actions.ToggleDownvote, onToggleDownvote)
  ];
}
