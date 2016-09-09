import { call, put, select } from 'redux-saga/effects';

import buildAction from 'helpers/buildAction';
import { fetchComments as fetchCommentsAPI, submitComment } from 'effects/redditAPI';
import * as Actions from 'constants/actions';
import { waitFor } from 'sagas/helpers';
import { withThrobber } from 'sagas/throbberSaga';
import { getSort, getReplyForm } from 'selectors/threadSelectors';
import { getThingId } from 'selectors/entityRepositorySelectors';
import { getAuthenticatedUser } from 'selectors/authenticationSelectors';

export function* fetchComments() {
  yield* withThrobber(function* () {
    const sort = yield select(getSort);

    const {
      list: {
        entities, result
      },
      post
    } = yield call(fetchCommentsAPI, '51xl1a', sort);

    yield put(buildAction(Actions.EntitiesHaveChanged, entities));
    yield put(buildAction(Actions.CommentsHaveBeenLoaded, result));
    yield put(buildAction(Actions.PostHasBeenLoaded, post));
  });
}

function* createTransientComment(threadId, transientId, text, author) {
  yield put(buildAction(Actions.CreateTransientComment, {
    threadId,
    text,
    transientId,
    author
  }));
  yield put(buildAction(Actions.SendReplyForm, threadId));
}

export function* onSubmit({ payload }) {
  const threadId = payload;

  const author = yield select(getAuthenticatedUser);
  const thingId = yield select(appState => getThingId(appState, threadId));
  const transientId = `transient-${Date.now().toString()}`;

  let created = false;
  while (!created) {
    try {
      const { text } = yield select(appState => getReplyForm(appState, threadId));

      // First thing obviously is creating transient Comment entity
      // so that user can immediately see the Comment in the UI
      yield* createTransientComment(
        threadId,
        transientId,
        text,
        author
      );

      // Call the reddit API
      const { entities, result } = yield call(submitComment, thingId, text);

      // Just remove the transient record, update Entity repository with
      // newly created Comment entity which is provided by the API submit call
      // and finally just put the reference on the new Comment in tree of Comments
      yield put(buildAction(Actions.RemoveTransientComment, { threadId, transientId }));
      yield put(buildAction(Actions.EntitiesHaveChanged, entities));
      yield put(buildAction(Actions.CreateComment, {
        commentId: result,
        threadId
      }));

      // Since transaction has been completed,
      // which means that Comment has been sucesfully
      // submitted on Reddit, we can just cancel the Saga
      created = true;
    } catch (ex) {
      console.warn(ex);

      // When Reddit API fails, we just remove the transient Comment
      // and re-enable ReplyForm so that user can retry.
      yield put(buildAction(Actions.RemoveTransientComment, { threadId, transientId }));
      yield put(buildAction(Actions.SendingReplyFormFailed, threadId));

      // We can't just wait for any Retry action,
      // it's important to wait for Retry action for specific thread
      yield* waitFor(Actions.RetryReplyForm, retryThreadId => retryThreadId === threadId);
    }
  }
}
