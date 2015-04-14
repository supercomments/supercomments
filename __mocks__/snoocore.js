var fs = require('fs');

var posts = JSON.parse(fs.readFileSync('fixtures/posts.json', 'utf8'));
var comment = JSON.parse(fs.readFileSync('fixtures/comment.json', 'utf8'));
var comments = JSON.parse(fs.readFileSync('fixtures/comments.json', 'utf8'));

function MockPromise(payload) {
  this.then = function(callback) {
    var result = callback(payload);
    if (result instanceof MockPromise) {
      return result;
    }
    else {
      return new MockPromise(result);
    }
  };
}

function MockAPI(payload) {
  this.get = function() {
    return new MockPromise(payload);
  };

  this.post = function() {
    return new MockPromise(payload);
  };
}

function Snoocore() {
  var self = this;

  self.path = function(path) {
    var payload;
    switch(path) {
      case 'search.json': payload = posts.get; break;
      case '/api/v1/me': payload = { name: 'username' }; break;
      case '/api/comment': payload = comment; break;
      case 'comments/123.json': payload = comments; break;
    }
    return new MockAPI(payload);
  };

  self.path.auth = jest.genMockFunction().mockImplementation(function() {
    return new MockPromise();
  });

  [ 'on', 'getImplicitAuthUrl' ].forEach(function(method) {
    self.path[method] = jest.genMockFunction();
  });

  return self.path;
}

module.exports = Snoocore;