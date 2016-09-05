import * as Actions from 'constants/actions';

const initialState = {
  comments: []
};

export default (state = initialState, { type, payload }) => {
  switch (type) {
    case Actions.CommentsHaveBeenLoaded:
      return {
        ...state,
        comments: payload
      };

    default:
      return state;
  }
};
