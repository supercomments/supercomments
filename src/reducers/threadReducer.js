import * as Actions from 'constants/actions';

const initialState = {
  rootComments: [],
  replying: []
};

export default (state = initialState, { type, payload }) => {
  switch (type) {
    case Actions.CommentsHaveBeenLoaded:
      return {
        ...state,
        rootComments: payload
      };

    default:
      return state;
  }
};
