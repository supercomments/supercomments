import { call, put } from 'redux-saga/effects';

import buildAction from 'buildAction';
import { fetchComments as fetchCommentsAPI } from 'effects/redditAPI';
import * as Actions from 'constants/actions';
import { withThrobber } from 'sagas/throbberSaga';

export function* fetchComments() {
  yield* withThrobber(function* () {
    const { entities, result } = yield call(fetchCommentsAPI, '4kdvns');

    yield put(buildAction(Actions.EntitiesHaveChanged, entities));
    yield put(buildAction(Actions.CommentsHaveBeenLoaded, result));
  });
}
