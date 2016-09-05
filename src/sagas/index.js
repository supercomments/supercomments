import { fork } from 'redux-saga/effects';

import { fetchComments } from 'sagas/threadSaga';

export default function* () {
  yield [
    fork(fetchComments)
  ];
}
