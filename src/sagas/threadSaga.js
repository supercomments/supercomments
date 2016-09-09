import { call, put, select } from 'redux-saga/effects';

import buildAction from 'helpers/buildAction';
import { fetchComments as fetchCommentsAPI } from 'effects/redditAPI';
import * as Actions from 'constants/actions';
import { withThrobber } from 'sagas/throbberSaga';
import { getSort } from 'selectors/threadSelectors';

export function* fetchComments() {
  yield* withThrobber(function* () {
    const sort = yield select(getSort);

    const {
      list: {
        entities, result
      },
      post
    } = yield call(fetchCommentsAPI, '51wvbm', sort);

    yield put(buildAction(Actions.EntitiesHaveChanged, entities));
    yield put(buildAction(Actions.CommentsHaveBeenLoaded, result));
    yield put(buildAction(Actions.PostHasBeenLoaded, post));
  });
}
