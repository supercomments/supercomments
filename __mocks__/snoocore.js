var fs = require('fs');

var posts = JSON.parse(fs.readFileSync('fixtures/posts.json', 'utf8'));
var comment = JSON.parse(fs.readFileSync('fixtures/comment.json', 'utf8'));
var comments = JSON.parse(fs.readFileSync('fixtures/comments.json', 'utf8'));

function MockPromise(payload) {
  this.payload = payload;
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
  this.payload = payload; // Make it convenient to get the payload

  this.get = jest.genMockFunction().mockImplementation(function(arg) {
    if (typeof(payload) === 'function') {
      return new MockPromise(payload(arg));
    }
    else {
      return new MockPromise(payload);
    }
  });

  this.post = jest.genMockFunction().mockImplementation(function(arg) {
    if (typeof(payload) === 'function') {
      return new MockPromise(payload(arg));
    }
    else {
      return new MockPromise(payload);
    }
  });
}

var singleton;

function Snoocore() {
  if (singleton) {
    return singleton;
  }
  var self = this;

  var responses = {
    'search.json': new MockAPI(function(arg) {
      if (arg.q === 'url:fail') {
        return { data: { children: [] }};
      }
      else {
        return posts.get;
      }
    }),
    '/api/v1/me': new MockAPI({ name: 'username', inbox_count: 4 }),
    '/api/comment': new MockAPI(comment),
    'comments/123.json': new MockAPI(comments)
  };

  self.path = function(path) {
    if (!responses[path]) {
      // Create a mock API that returns nothing if we haven't defined one explicitly
      responses[path] = new MockAPI();
    }
    return responses[path];
  };

  self.path.auth = jest.genMockFunction().mockImplementation(function() {
    return new MockPromise();
  });

  self.path.deauth = jest.genMockFunction().mockImplementation(function() {
    return new MockPromise();
  });

  [ 'on', 'getImplicitAuthUrl' ].forEach(function(method) {
    self.path[method] = jest.genMockFunction();
  });

  singleton = self.path;
  return self.path;
}

module.exports = Snoocore;