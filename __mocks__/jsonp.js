function MockPromise(payload) {
  this.payload = payload;
  this.then = (callback) => {
    var result = callback(this.payload);
    if (result instanceof MockPromise) {
      return result;
    }
    else {
      return new MockPromise(result);
    }
  };
}

Promise = function(callback) {
  this._promise = new MockPromise("foo");
  callback((data) => {
    this._promise.payload = data;
  });
  return this._promise;
};

Promise.all = jest.genMockFunction().mockImplementation(function(promises) {
  var values = promises.map(function(promise) {
    return promise.payload;
  });
  return new MockPromise(values);
});

var jsonp = jest.genMockFunction().mockImplementation(function(url, callback) {
  callback(null, { response: { posts: "10" }});
});

module.exports = jsonp;