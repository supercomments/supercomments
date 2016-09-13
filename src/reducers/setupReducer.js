import * as Actions from 'constants/actions';

export default (state = {}, action) => {
  const {
    type,
    payload
  } = action;

  switch (type) {
    case Actions.Setup:
      return payload;

    default:
      return state;
  }
};
