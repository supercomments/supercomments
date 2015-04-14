var Constants = [
  'UPDATE_URL',
  'LOGIN',
  'LOGOUT',
  'SUBMIT_COMMENT',
  'SORT_BY_BEST',
  'SORT_BY_NEWEST',
  'SORT_BY_OLDEST',
  'VOTE',
  'EDIT_COMMENT',
  'DELETE_COMMENT',
  'REPORT_COMMENT'
].reduce(function(current, next) {
  current[next] = next;
  return current;
}, {});

module.exports = Constants;