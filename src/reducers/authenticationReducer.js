import * as Actions from 'constants/actions';

const initialState = {
  user: null
};

export default (state = initialState, { type, payload }) => {
  switch (type) {
    case Actions.LoggedIn:
      return {
        ...state,
        user: payload
      };

    default:
      return state;
  }
};
