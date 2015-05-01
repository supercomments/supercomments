require('babel/polyfill');

jest.dontMock('util');
jest.dontMock('capitalize');
jest.dontMock('immutable');
jest.dontMock('immutable/contrib/cursor');
jest.dontMock('../../app/stores/RedditStore');

var url = 'http://www.test.com/';

var FluxxorTestUtils, Immutable, Cursor, fakeFlux, myStore, myStoreSpy, redditAPI;
beforeEach(function() {
  var Snoocore = require('snoocore');
  redditAPI = new Snoocore();
  FluxxorTestUtils = require('fluxxor-test-utils').extendJasmineMatchers(this);
  Immutable = require('immutable');
  Cursor = require('immutable/contrib/cursor');

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
    fakeFlux.dispatcher.dispatch({ type: 'UPDATING_URL', payload: { url: url }});
    expect(myStore.state.url).toBe(url);
    fakeFlux.dispatcher.dispatch({ type: 'UPDATED_URL', payload: { reddit: { subreddit: 'programming' }}});
    expect(myStore.state.subreddit).toBe('/r/Programming');
    expect(myStore.state.subredditUrl).toBe('http://www.reddit.com/r/Programming');
  });
});

describe('onLogin', function() {
  it('updates the user name', function() {
    fakeFlux.dispatcher.dispatch({ type: 'LOGGING_IN' });
    expect(myStore.state.loggingIn).toBe(true);
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
    myStoreSpy.resetCalls();
    fakeFlux.dispatcher.dispatch({ type: 'LOGGED_IN', payload: 'username' });
    expect(myStore.state.loggingIn).toBe(false);
    expect(myStore.state.userName).toBe('username');
    expect(myStore.state.profileUrl).toBe('http://www.reddit.com/user/username');
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
  });
});

describe('onLogout', function() {
  it('clears the user name', function() {
    fakeFlux.dispatcher.dispatch({ type: 'LOGOUT' });
    // expect(redditAPI.deauth).toBeCalled(); // uncomment when `deauth` is supported properly
    expect(myStore.state.userName).toBeNull();
  });
});

describe('onSubmitComment', function() {
  it('adds a new top-level comment when the parent is a post', function() {
    var parent = Immutable.fromJS({ id: 'parent_id', name: 't3_parent_id', replies: [] });
    fakeFlux.dispatcher.dispatch({
      type: 'SUBMITTING_COMMENT',
      payload: { id: '123', parent: parent, body: 'the text' }
    });
    expect(parent.get('replies').count()).toBe(0);
    expect(myStore.state.comments.count()).toBe(1);
    expect(myStore.state.comments.getIn([ 0, 'id' ])).toBe('123');
    expect(myStore.state.comments.getIn([ 0, 'body' ])).toBe('the text');
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
    myStoreSpy.resetCalls();
    fakeFlux.dispatcher.dispatch({
      type: 'SUBMITTED_COMMENT', 
      payload: { id: '123', parent: parent, comment: { id: '456' }}
    });
    expect(myStore.state.comments.getIn([ 0, 'id' ])).toBe('456'); // From fixture file
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
  });
  it('adds a new reply when the parent is a comment', function() {
    myStore.state.comments = Immutable.fromJS([
      { id: 'parent_id', name: 't1_parent_id', replies: [] }
    ]);
    var parent = Cursor.from(myStore.state.comments, [ 0 ], (newData) => {
      myStore.state.comments = newData;
    });
    fakeFlux.dispatcher.dispatch({
      type: 'SUBMITTING_COMMENT',
      payload: { id: '123', parent: parent, body: 'the text' }
    });
    parent = Cursor.from(myStore.state.comments, [ 0 ], (newData) => {
      myStore.state.comments = newData;
    });
    expect(parent.get('replies').count()).toBe(1);
    expect(myStore.state.comments.count()).toBe(1);
    expect(parent.getIn([ 'replies', 0, 'id' ])).toBe('123');
    expect(parent.getIn([ 'replies', 0, 'body' ])).toBe('the text');
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
    myStoreSpy.resetCalls();
    fakeFlux.dispatcher.dispatch({
      type: 'SUBMITTED_COMMENT', 
      payload: { id: '123', parent: parent, comment: { id: '456' }}
    });
    parent = myStore.state.comments.get(0);
    expect(parent.getIn([ 'replies', 0, 'id' ])).toBe('456'); // From fixture file
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
  });
  it('adds a second reply when the parent is a comment with an existing reply', function() {
    myStore.state.comments = Immutable.fromJS([
      { id: 'parent_id', name: 't1_parent_id', replies: [ { id: 'child' } ] }
    ]);
    var parent = Cursor.from(myStore.state.comments, [ 0 ], (newData) => {
      myStore.state.comments = newData;
    });
    fakeFlux.dispatcher.dispatch({
      type: 'SUBMITTING_COMMENT',
      payload: { id: '123', parent: parent, body: 'the text' }
    });
    parent = Cursor.from(myStore.state.comments, [ 0 ], (newData) => {
      myStore.state.comments = newData;
    });
    expect(parent.get('replies').count()).toBe(2);
    expect(myStore.state.comments.count()).toBe(1);
    expect(parent.getIn([ 'replies', 0, 'id' ])).toBe('123');
    expect(parent.getIn([ 'replies', 0, 'body' ])).toBe('the text');
    expect(parent.getIn([ 'replies', 1, 'id' ])).toBe('child');
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
    myStoreSpy.resetCalls();
    fakeFlux.dispatcher.dispatch({
      type: 'SUBMITTED_COMMENT', 
      payload: { id: '123', parent: parent, comment: { id: '456' }}
    });
    parent = myStore.state.comments.get(0);
    expect(parent.getIn([ 'replies', 0, 'id' ])).toBe('456'); // From fixture file
    expect(parent.getIn([ 'replies', 1, 'id' ])).toBe('child');
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
 });
});

describe('onVote', function() {
  beforeEach(function() {
    myStore.state.comments = Immutable.fromJS([
      { name: 'thing_name', likes: null, score: 10 },
      { name: 'thing_name', likes: true, score: 10 },
      { name: 'thing_name', likes: false, score: 10 }
    ]);
  });
  it('decrements the score of a thing when it is downvoted', function() {
    var thing = Cursor.from(myStore.state.comments, [ 0 ], (newData) => {
      myStore.state.comments = newData;
    });
    var payload = {
      thing: thing,
      dir: -1
    };
    fakeFlux.dispatcher.dispatch({ type: 'VOTING', payload: payload });
    thing = myStore.state.comments.get(0);
    expect(thing.get('likes')).toBe(false);
    expect(thing.get('score')).toBe(9);
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
    myStoreSpy.resetCalls();
    fakeFlux.dispatcher.dispatch({ type: 'VOTED', payload: payload.thing });
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
  });
  it('lowers the score of a thing by two when it goes from upvoted to downvoted', function() {
    var thing = Cursor.from(myStore.state.comments, [ 1 ], (newData) => {
      myStore.state.comments = newData;
    });
    var payload = {
      thing: thing,
      dir: -1
    };
    fakeFlux.dispatcher.dispatch({ type: 'VOTING', payload: payload });
    thing = myStore.state.comments.get(1);
    expect(thing.get('likes')).toBe(false);
    expect(thing.get('score')).toBe(8);
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
    myStoreSpy.resetCalls();
    fakeFlux.dispatcher.dispatch({ type: 'VOTED', payload: payload.thing });
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
  });
  it('increments the score of a thing when it is upvoted', function() {
    var thing = Cursor.from(myStore.state.comments, [ 0 ], (newData) => {
      myStore.state.comments = newData;
    });
    var payload = {
      thing: thing,
      dir: 1
    };
    fakeFlux.dispatcher.dispatch({ type: 'VOTING', payload: payload });
    thing = myStore.state.comments.get(0);
    expect(thing.get('likes')).toBe(true);
    expect(thing.get('score')).toBe(11);
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
    myStoreSpy.resetCalls();
    fakeFlux.dispatcher.dispatch({ type: 'VOTED', payload: payload.thing });
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
  });
  it('raises the score of a thing by two when it goes from downvoted to upvoted', function() {
    var thing = Cursor.from(myStore.state.comments, [ 2 ], (newData) => {
      myStore.state.comments = newData;
    });
    var payload = {
      thing: thing,
      dir: 1
    };
    fakeFlux.dispatcher.dispatch({ type: 'VOTING', payload: payload });
    thing = myStore.state.comments.get(2);
    expect(thing.get('likes')).toBe(true);
    expect(thing.get('score')).toBe(12);
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
    myStoreSpy.resetCalls();
    fakeFlux.dispatcher.dispatch({ type: 'VOTED', payload: payload.thing });
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
  });
  it('decrements the score of a thing when it stops being upvoted', function() {
    var thing = Cursor.from(myStore.state.comments, [ 1 ], (newData) => {
      myStore.state.comments = newData;
    });
    var payload = {
      thing: thing,
      dir: 0
    };
    fakeFlux.dispatcher.dispatch({ type: 'VOTING', payload: payload });
    thing = myStore.state.comments.get(1);
    expect(thing.get('likes')).toBe(null);
    expect(thing.get('score')).toBe(9);
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
    myStoreSpy.resetCalls();
    fakeFlux.dispatcher.dispatch({ type: 'VOTED', payload: payload.thing });
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
  });
  it('increments the score of a thing when it stops being downvoted', function() {
    var thing = Cursor.from(myStore.state.comments, [ 2 ], (newData) => {
      myStore.state.comments = newData;
    });
    var payload = {
      thing: thing,
      dir: 0
    };
    fakeFlux.dispatcher.dispatch({ type: 'VOTING', payload: payload });
    thing = myStore.state.comments.get(2);
    expect(thing.get('likes')).toBe(null);
    expect(thing.get('score')).toBe(11);
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
    myStoreSpy.resetCalls();
    fakeFlux.dispatcher.dispatch({ type: 'VOTED', payload: payload.thing });
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
  });
});

describe('onEditComment', function() {
  it('modifies the comment body when it is edited', function() {
    myStore.state.comments = Immutable.fromJS([
      { name: 'the_name', body: 'old_body' }
    ]);
    var comment = Cursor.from(myStore.state.comments, [ 0 ], (newData) => {
      myStore.state.comments = newData;
    });
    var payload = { comment: comment, body: 'new_body' };
    fakeFlux.dispatcher.dispatch({ type: 'EDITING_COMMENT', payload: payload });
    comment = myStore.state.comments.get(0);
    expect(comment.get('body')).toBe('new_body');
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
    myStoreSpy.resetCalls();
    fakeFlux.dispatcher.dispatch({ type: 'EDITED_COMMENT', payload: comment });
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
  });
});

describe('onDeleteComment', function() {
  it('changes the comment author and body to "[deleted"]', function() {
    myStore.state.comments = Immutable.fromJS([
      { name: 'the_name', body: 'old_body' }
    ]);
    var comment = Cursor.from(myStore.state.comments, [ 0 ], (newData) => {
      myStore.state.comments = newData;
    });
    fakeFlux.dispatcher.dispatch({ type: 'DELETING_COMMENT', payload: comment });
    comment = myStore.state.comments.get(0);
    expect(comment.get('author')).toBe('[deleted]');
    expect(comment.get('body')).toBe('[deleted]');
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
    myStoreSpy.resetCalls();
    fakeFlux.dispatcher.dispatch({ type: 'DELETED_COMMENT', payload: comment });
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
  });
});

describe('onItemChanged', function() {
  var comment;
  beforeEach(function() {
    comment = Immutable.fromJS({ id: '123' });
    fakeFlux.dispatcher.dispatch({ type: 'ITEM_CHANGED', payload: { comment: comment, newState: { property: 'value' }}});
  });
  it('extends the default state of the comment', function() {
    expect(myStore.getItemState(comment)).toEqual({ formExpanded: true, property: 'value' });
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
  });
  it('extends the existing state', function() {
    fakeFlux.dispatcher.dispatch({ type: 'ITEM_CHANGED', payload: { comment: comment, newState: { property2: 'value2' }}});
    expect(myStore.getItemState(comment)).toEqual({ formExpanded: true, property: 'value', property2: 'value2' });
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
  });
});
