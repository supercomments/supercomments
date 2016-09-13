import moment from 'moment';
import { call, put, select } from 'redux-saga/effects';

import buildAction from 'helpers/buildAction';
import { fetchComments as fetchCommentsAPI, submitComment } from 'effects/redditAPI';
import * as Actions from 'constants/actions';
import * as Entities from 'constants/entities';
import { withThrobber } from 'sagas/throbberSaga';
import { optimisticallyCreateEntity } from 'sagas/entityRepositorySaga';
import { getSort, getReplyForm } from 'selectors/threadSelectors';
import { getThread } from 'selectors/entityRepositorySelectors';
import { getAuthenticatedUser } from 'selectors/authenticationSelectors';
import { getRedditId } from 'selectors/setupSelectors';

export function* fetchComments() {
  const sort = yield select(getSort);
  const redditId = yield select(getRedditId);

  const {
    entities,
    result
  } = yield call(fetchCommentsAPI, redditId, sort);

  yield put(buildAction(Actions.EntitiesHaveChanged, entities));
  yield put(buildAction(Actions.PostHasBeenLoaded, result));
}

export function* fetchCommentsWithThrobber() {
  yield* withThrobber(fetchComments);
}

export function* onSubmit({ payload }) {
  const threadId = payload;

  const author = yield select(getAuthenticatedUser);
  const thread = yield select(appState => getThread(appState, threadId));

  yield* optimisticallyCreateEntity(
    Entities.Comment,
    submitComment,
    function* createEntity() {
      yield put(buildAction(Actions.SendReplyForm, threadId));

      const { text } = yield select(appState => getReplyForm(appState, threadId));

      return {
        thingId: null,
        parent: threadId,
        author,
        body: text,
        votes: 1,
        upvoted: true,
        created: moment(),
        replies: []
      };
    },
    entity => ({
      thingId: thread.name,
      text: entity.body
    }),
    function* onRollback() {
      yield put(buildAction(Actions.SendingReplyFormFailed, threadId));
    },
    actionPayload => actionPayload.entityType === Entities.Comment && actionPayload.id === threadId
  );

  yield put(buildAction(Actions.ReplySubmitted, threadId));
}
