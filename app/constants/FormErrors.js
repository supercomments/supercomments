var FormErrors = [
  'COMMENT_EMPTY',
  'PAGE_NOT_SUBMITTED'
].reduce(function(current, next) {
  current[next] = next;
  return current;
}, {});

module.exports = FormErrors;