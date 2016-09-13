import { take } from 'redux-saga/effects';

export function* waitFor(action, predicate) {
  let result = false;

  while (!result) {
    const { payload } = yield take(action);
    result = predicate(payload);
  }
}
