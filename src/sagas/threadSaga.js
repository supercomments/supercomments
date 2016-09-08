import { call, put } from 'redux-saga/effects';

import buildAction from 'helpers/buildAction';
import { fetchComments as fetchCommentsAPI } from 'effects/redditAPI';
import * as Actions from 'constants/actions';
import { withThrobber } from 'sagas/throbberSaga';

export function* fetchComments() {
  yield* withThrobber(function* () {
    const {
      list: {
        entities, result
      },
      post
    } = yield call(fetchCommentsAPI, '4kdvns');

    yield put(buildAction(Actions.EntitiesHaveChanged, entities));
    yield put(buildAction(Actions.CommentsHaveBeenLoaded, result));
    yield put(buildAction(Actions.PostHasBeenLoaded, post));
  });
}
