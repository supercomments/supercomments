var Constants = [
  'UPDATING_URL',
  'UPDATED_URL',
  'LOGGING_IN',
  'LOGGED_IN',
  'LOGOUT',
  'SUBMITTING_COMMENT',
  'SUBMITTED_COMMENT',
  'RELOADING_COMMENTS',
  'RELOADED_COMMENTS',
  'SORT_BY_BEST',
  'SORT_BY_NEWEST',
  'SORT_BY_OLDEST',
  'VOTING',
  'VOTED',
  'EDITING_COMMENT',
  'EDITED_COMMENT',
  'DELETING_COMMENT',
  'DELETED_COMMENT',
  'REPORTING_COMMENT',
  'REPORTED_COMMENT',
  'ITEM_CHANGED',
  'SET_TOOLTIP'
].reduce(function(current, next) {
  current[next] = next;
  return current;
}, {});

module.exports = Constants;