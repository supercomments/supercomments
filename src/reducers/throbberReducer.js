import * as Actions from 'constants/actions';

const initialState = {
  loading: false
};

export default (state = initialState, { type }) => {
  switch (type) {
    case Actions.SetLoading:
      return {
        ...state,
        loading: true
      };

    case Actions.ResetLoading:
      return {
        ...state,
        loading: false
      };

    default:
      return state;
  }
};
