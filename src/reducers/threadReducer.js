import identityFunction from 'helpers/identityFunction';
import * as Actions from 'constants/actions';
import * as Sort from 'constants/sort';

const initialState = {
  replyForms: {},
  post: {
    subreddit: ''
  },
  sort: Sort.Best
};

const emptyReplyForm = {
  error: false,
  visible: false,
  text: ''
};

const updateReplyForm = (state, threadId, mutation = identityFunction) => {
  const replyForm = state.replyForms[threadId];

  return {
    ...state,
    replyForms: {
      ...state.replyForms,
      [threadId]: mutation(replyForm || emptyReplyForm)
    }
  };
};

export default (state = initialState, { type, payload }) => {
  switch (type) {

    case Actions.Reply: {
      const threadId = payload;

      return updateReplyForm(state, threadId, replyFormModel => ({
        ...replyFormModel,
        visible: !replyFormModel.visible
      }));
    }

    case Actions.ReplyFormChangeText: {
      const { threadId, text } = payload;

      return updateReplyForm(state, threadId, replyFormModel => ({
        ...replyFormModel,
        text
      }));
    }

    case Actions.PostHasBeenLoaded:
      return {
        ...state,
        post: payload
      };

    case Actions.Sort:
      return {
        ...state,
        sort: payload
      };

    case Actions.SendReplyForm:
      return updateReplyForm(state, payload, replyFormModel => ({
        ...replyFormModel,
        visible: false
      }));

    case Actions.SendingReplyFormFailed:
      return updateReplyForm(state, payload, replyFormModel => ({
        ...replyFormModel,
        visible: true,
        error: true
      }));

    case Actions.ReplySubmitted:
      return updateReplyForm(state, payload, () => emptyReplyForm);

    default:
      return state;
  }
};
