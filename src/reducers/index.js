import { combineReducers } from 'redux';

import authentication from 'reducers/authenticationReducer';
import thread from 'reducers/threadReducer';
import entityRepository from 'reducers/entityRepositoryReducer';
import throbber from 'reducers/throbberReducer';

export default combineReducers({
  authentication,
  thread,
  entityRepository,
  throbber
});
