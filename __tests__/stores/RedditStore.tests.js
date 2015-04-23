require('babelify/polyfill');

jest.dontMock('util');
jest.dontMock('capitalize');
jest.dontMock('../../app/stores/RedditStore');

var url = 'http://www.test.com/';

var FluxxorTestUtils, fakeFlux, myStore, myStoreSpy, redditAPI;
beforeEach(function() {
  var Snoocore = require('snoocore');
  redditAPI = new Snoocore();
  FluxxorTestUtils = require('fluxxor-test-utils').extendJasmineMatchers(this);

  // Create an empty global `localStorage` variable.
  localStorage = {};
  var RedditStore = require('../../app/stores/RedditStore');
  fakeFlux = FluxxorTestUtils.fakeFlux({ RedditStore: new RedditStore() });
  myStore = fakeFlux.store('RedditStore');
  myStore.waitFor = jest.genMockFunction().mockImplementation(function(stores, callback) {
    callback.apply(myStore);
  });
  myStoreSpy = fakeFlux.makeStoreEmitSpy('RedditStore');
});

describe('onUpdateUrl', function() {
  it('updates the URL, subreddit and subreddit URL', function() {
    fakeFlux.dispatcher.dispatch({ type: 'UPDATING_URL', payload: url });
    expect(myStore.getState().url).toBe(url);
    fakeFlux.dispatcher.dispatch({ type: 'UPDATED_URL', payload: { subreddit: 'programming' }});
    expect(myStore.getState().subreddit).toBe('/r/Programming');
    expect(myStore.getState().subredditUrl).toBe('http://www.reddit.com/r/Programming');
  });
});

describe('onLogin', function() {
  it('updates the user name', function() {
    fakeFlux.dispatcher.dispatch({ type: 'LOGGING_IN' });
    expect(myStore.getState().loggingIn).toBe(true);
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
    myStoreSpy.resetCalls();
    fakeFlux.dispatcher.dispatch({ type: 'LOGGED_IN', payload: 'username' });
    expect(myStore.getState().loggingIn).toBe(false);
    expect(myStore.getState().userName).toBe('username');
    expect(myStore.getState().profileUrl).toBe('http://www.reddit.com/user/username');
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
  });
});

describe('onLogout', function() {
  it('clears the user name', function() {
    fakeFlux.dispatcher.dispatch({ type: 'LOGOUT' });
    // expect(redditAPI.deauth).toBeCalled(); // uncomment when `deauth` is supported properly
    expect(myStore.getState().userName).toBeNull();
  });
});

describe('onSubmitComment', function() {
  it('adds a new top-level comment when the parent is a post', function() {
    var parent = { replies: [] };
    myStore.getState().comments = [];
    fakeFlux.dispatcher.dispatch({
      type: 'SUBMITTING_COMMENT',
      payload: { id: '123', parent: parent, body: 'the text' }
    });
    expect(parent.replies.length).toBe(0);
    expect(myStore.getState().comments.length).toBe(1);
    expect(myStore.getState().comments[0].id).toBe('123');
    expect(myStore.getState().comments[0].body).toBe('the text');
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
    myStoreSpy.resetCalls();
    fakeFlux.dispatcher.dispatch({
      type: 'SUBMITTED_COMMENT', 
      payload: { id: '123', parent: parent, comment: { id: '456' }}
    });
    expect(myStore.getState().comments[0].id).toBe('456'); // From fixture file
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
  });
  it('adds a new reply when the parent is a comment', function() {
    var parent = { parent_id: 'parent', replies: [] };
    myStore.getState().comments = [];
    fakeFlux.dispatcher.dispatch({
      type: 'SUBMITTING_COMMENT',
      payload: { id: '123', parent: parent, body: 'the text' }
    });
    expect(parent.replies.length).toBe(1);
    expect(myStore.getState().comments.length).toBe(0);
    expect(parent.replies[0].id).toBe('123');
    expect(parent.replies[0].body).toBe('the text');
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
    myStoreSpy.resetCalls();
    fakeFlux.dispatcher.dispatch({
      type: 'SUBMITTED_COMMENT', 
      payload: { id: '123', parent: parent, comment: { id: '456' }}
    });
    expect(parent.replies[0].id).toBe('456'); // From fixture file
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
  });
  it('adds a second reply when the parent is a comment with an existing reply', function() {
    var parent = { parent_id: 'parent', replies: [{ id: 'first' }] };
    myStore.getState().comments = [];
    fakeFlux.dispatcher.dispatch({
      type: 'SUBMITTING_COMMENT',
      payload: { id: '123', parent: parent, body: 'the text' }
    });
    expect(parent.replies.length).toBe(2);
    expect(myStore.getState().comments.length).toBe(0);
    expect(parent.replies[0].id).toBe('123');
    expect(parent.replies[0].body).toBe('the text');
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
    myStoreSpy.resetCalls();
    fakeFlux.dispatcher.dispatch({
      type: 'SUBMITTED_COMMENT', 
      payload: { id: '123', parent: parent, comment: { id: '456' }}
    });
    expect(parent.replies[0].id).toBe('456'); // From fixture file
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
  });
});

describe('onVote', function() {
  it('decrements the score of a thing when it is downvoted', function() {
    var payload = {
      thing: { name: 'thing_name', likes: null, score: 10 },
      dir: -1
    };
    fakeFlux.dispatcher.dispatch({ type: 'VOTING', payload: payload });
    expect(payload.thing.likes).toBe(false);
    expect(payload.thing.score).toBe(9);
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
    myStoreSpy.resetCalls();
    fakeFlux.dispatcher.dispatch({ type: 'VOTED', payload: payload.thing });
    expect(myStoreSpy.getLastCall()).toBeUndefined();
  });
  it('lowers the score of a thing by two when it goes from upvoted to downvoted', function() {
    var payload = {
      thing: { name: 'thing_name', likes: true, score: 10 },
      dir: -1
    };
    fakeFlux.dispatcher.dispatch({ type: 'VOTING', payload: payload });
    expect(payload.thing.likes).toBe(false);
    expect(payload.thing.score).toBe(8);
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
    myStoreSpy.resetCalls();
    fakeFlux.dispatcher.dispatch({ type: 'VOTED', payload: payload.thing });
    expect(myStoreSpy.getLastCall()).toBeUndefined();
  });
  it('increments the score of a thing when it is upvoted', function() {
    var payload = {
      thing: { name: 'thing_name', likes: null, score: 10 },
      dir: 1
    };
    fakeFlux.dispatcher.dispatch({ type: 'VOTING', payload: payload });
    expect(payload.thing.likes).toBe(true);
    expect(payload.thing.score).toBe(11);
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
    myStoreSpy.resetCalls();
    fakeFlux.dispatcher.dispatch({ type: 'VOTED', payload: payload.thing });
    expect(myStoreSpy.getLastCall()).toBeUndefined();
  });
  it('raises the score of a thing by two when it goes from downvoted to upvoted', function() {
    var payload = {
      thing: { name: 'thing_name', likes: false, score: 10 },
      dir: 1
    };
    fakeFlux.dispatcher.dispatch({ type: 'VOTING', payload: payload });
    expect(payload.thing.likes).toBe(true);
    expect(payload.thing.score).toBe(12);
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
    myStoreSpy.resetCalls();
    fakeFlux.dispatcher.dispatch({ type: 'VOTED', payload: payload.thing });
    expect(myStoreSpy.getLastCall()).toBeUndefined();
  });
  it('decrements the score of a thing when it stops being upvoted', function() {
    var payload = {
      thing: { name: 'thing_name', likes: true, score: 10 },
      dir: 0
    };
    fakeFlux.dispatcher.dispatch({ type: 'VOTING', payload: payload });
    expect(payload.thing.likes).toBe(null);
    expect(payload.thing.score).toBe(9);
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
    myStoreSpy.resetCalls();
    fakeFlux.dispatcher.dispatch({ type: 'VOTED', payload: payload.thing });
    expect(myStoreSpy.getLastCall()).toBeUndefined();
  });
  it('increments the score of a thing when it stops being downvoted', function() {
    var payload = {
      thing: { name: 'thing_name', likes: false, score: 10 },
      dir: 0
    };
    fakeFlux.dispatcher.dispatch({ type: 'VOTING', payload: payload });
    expect(payload.thing.likes).toBe(null);
    expect(payload.thing.score).toBe(11);
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
    myStoreSpy.resetCalls();
    fakeFlux.dispatcher.dispatch({ type: 'VOTED', payload: payload.thing });
    expect(myStoreSpy.getLastCall()).toBeUndefined();
  });
});

describe('onEditComment', function() {
  it('modifies the comment body when it is edited', function() {
    var comment = { name: 'the_name', body: 'old_body' };
    var payload = { comment: comment, body: 'new_body' };
    fakeFlux.dispatcher.dispatch({ type: 'EDITING_COMMENT', payload: payload });
    expect(comment.body).toBe('new_body');
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
    myStoreSpy.resetCalls();
    fakeFlux.dispatcher.dispatch({ type: 'EDITED_COMMENT', payload: comment });
    expect(myStoreSpy.getLastCall()).toBeUndefined();
  });
});

describe('onDeleteComment', function() {
  it('changes the comment author and body to "[deleted"]', function() {
    var comment = { name: 'the_name', author: 'the_author', body: 'old_body' };
    fakeFlux.dispatcher.dispatch({ type: 'DELETING_COMMENT', payload: comment });
    expect(comment.author).toBe('[deleted]');
    expect(comment.body).toBe('[deleted]');
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
    myStoreSpy.resetCalls();
    fakeFlux.dispatcher.dispatch({ type: 'DELETED_COMMENT', payload: comment });
    expect(myStoreSpy.getLastCall()).toBeUndefined();
  });
});
