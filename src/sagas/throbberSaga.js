import { put } from 'redux-saga/effects';

import buildAction from 'helpers/buildAction';
import * as Actions from 'constants/actions';

export function* withThrobber(saga) {
  yield put(buildAction(Actions.SetLoading));

  try {
    yield* saga();
  } catch (ex) {
    throw ex;
  } finally {
    yield put(buildAction(Actions.ResetLoading));
  }
}
