import moment from 'moment';
import { call, put, select } from 'redux-saga/effects';

import buildAction from 'helpers/buildAction';
import { fetchComments as fetchCommentsAPI, submitComment } from 'effects/redditAPI';
import * as Actions from 'constants/actions';
import * as Entities from 'constants/entities';
import { withThrobber } from 'sagas/throbberSaga';
import { optimisticallyCreateEntity } from 'sagas/entityRepositorySaga';
import { getSort, getReplyForm } from 'selectors/threadSelectors';
import { getComment } from 'selectors/entityRepositorySelectors';
import { getAuthenticatedUser } from 'selectors/authenticationSelectors';

export function* fetchComments() {
  yield* withThrobber(function* () {
    const sort = yield select(getSort);

    const {
      list: {
        entities
      },
      post
    } = yield call(fetchCommentsAPI, '4cocqf', sort);

    yield put(buildAction(Actions.EntitiesHaveChanged, entities));
    yield put(buildAction(Actions.PostHasBeenLoaded, post));
  });
}

export function* onSubmit({ payload }) {
  const threadId = payload;

  const author = yield select(getAuthenticatedUser);
  const parentComment = yield select(appState => getComment(appState, threadId));

  yield* optimisticallyCreateEntity(
    Entities.Comment,
    submitComment,
    function* createEntity() {
      yield put(buildAction(Actions.SendReplyForm, threadId));

      const { text } = yield select(appState => getReplyForm(appState, threadId));

      return {
        thingId: null,
        parent: parentComment.id,
        author,
        body: text,
        score: 1,
        created: moment(),
        replies: []
      };
    },
    entity => ({
      thingId: parentComment.thingId,
      text: entity.body
    }),
    function* onRollback() {
      yield put(buildAction(Actions.SendingReplyFormFailed, threadId));
    },
    actionPayload => actionPayload.entityType === Entities.Comment && actionPayload.id === threadId
  );

  yield put(buildAction(Actions.ReplySubmitted, threadId));
}
