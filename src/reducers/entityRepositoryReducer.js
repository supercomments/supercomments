import { merge } from 'lodash';

import * as Actions from 'constants/actions';

const initialState = {
  comments: []
};

export default (state = initialState, { type, payload }) => {
  switch (type) {
    case Actions.EntitiesHaveChanged:
      return merge(state, payload);

    default:
      return state;
  }
};
