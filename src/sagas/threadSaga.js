import moment from 'moment';
import { call, put, select } from 'redux-saga/effects';

import buildAction from 'helpers/buildAction';
import { fetchComments as fetchCommentsAPI, submitComment, vote } from 'effects/redditAPI';
import * as Actions from 'constants/actions';
import * as Entities from 'constants/entities';
import { withThrobber } from 'sagas/throbberSaga';
import { optimisticallyCreateEntity, optimisticallUpdateEntity } from 'sagas/entityRepositorySaga';
import { getSort, getReplyForm } from 'selectors/threadSelectors';
import { getThread, getPost } from 'selectors/entityRepositorySelectors';
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
        downvoted: false,
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

export function* onToggleUpvotePost() {
  const post = yield select(getPost);

  yield* optimisticallUpdateEntity(
    post.id,
    Entities.Post,
    vote,
    function* createEntity() { // eslint-disable-line require-yield
      const upvoted = !post.upvoted;

      return {
        ...post,
        upvoted: !post.upvoted,
        votes: post.votes + (upvoted ? 1 : -1)
      };
    },
    entity => ({
      direction: entity.upvoted ? 1 : 0,
      thingId: entity.name
    })
  );
}

export function* onToggleUpvote({ payload }) {
  const threadId = payload;

  const comment = yield select(appState => getThread(appState, threadId));

  yield* optimisticallUpdateEntity(
    comment.id,
    Entities.Comment,
    vote,
    function* createEntity() { // eslint-disable-line require-yield
      const upvoted = !comment.upvoted;
      const downvoted = upvoted ? false : comment.downvoted;

      const calculateVotes = () => {
        const scoreDiff = comment.downvoted ? 2 : 1;
        return comment.votes + (upvoted ? scoreDiff : -1);
      };

      return {
        ...comment,
        downvoted,
        upvoted,
        votes: calculateVotes()
      };
    },
    entity => ({
      direction: entity.upvoted ? 1 : 0,
      thingId: entity.name
    })
  );
}

export function* onToggleDownvote({ payload }) {
  const threadId = payload;

  const comment = yield select(appState => getThread(appState, threadId));

  yield* optimisticallUpdateEntity(
    comment.id,
    Entities.Comment,
    vote,
    function* createEntity() { // eslint-disable-line require-yield
      const downvoted = !comment.downvoted;
      const upvoted = downvoted ? false : comment.upvoted;

      const calculateVotes = () => {
        const scoreDiff = comment.upvoted ? -2 : -1;
        return comment.votes + (downvoted ? scoreDiff : 1);
      };

      return {
        ...comment,
        downvoted,
        upvoted,
        votes: calculateVotes()
      };
    },
    entity => ({
      direction: entity.downvoted ? -1 : 0,
      thingId: entity.name
    })
  );
}
