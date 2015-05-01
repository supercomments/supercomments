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

Promise = (typeof(Promise) === 'undefined') ? {} : Promise;

Promise.all = jest.genMockFunction().mockImplementation(function(promises) {
  var values = promises.map(function(promise) {
    return promise.payload;
  });
  return new MockPromise(values);
});

var request = jest.genMockFunction().mockImplementation(function(/* options */) {
  return new MockPromise('{ "response": { "posts": "10" }}');
});

module.exports = request;