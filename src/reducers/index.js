import { combineReducers } from 'redux';

import thread from 'reducers/threadReducer';
import entityRepository from 'reducers/entityRepositoryReducer';

export default combineReducers({
  thread,
  entityRepository
});
