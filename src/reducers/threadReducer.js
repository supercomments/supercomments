import identityFunction from 'helpers/identityFunction';
import * as Actions from 'constants/actions';

const initialState = {
  rootComments: [],
  replyForms: {}
};

const emptyReplyForm = {
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
    case Actions.CommentsHaveBeenLoaded:
      return {
        ...state,
        rootComments: payload
      };

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

    default:
      return state;
  }
};
