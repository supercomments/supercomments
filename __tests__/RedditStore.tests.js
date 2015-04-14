jest.dontMock('util');
jest.dontMock('../app/stores/RedditStore');

var url = 'http://www.test.com/';

var FluxxorTestUtils, fakeFlux, myStore, myStoreSpy;
beforeEach(function() {
  FluxxorTestUtils = require('fluxxor-test-utils').extendJasmineMatchers(this);

  // Create an empty global `localStorage` variable.
  localStorage = {};
  var RedditStore = require('../app/stores/RedditStore');
  fakeFlux = FluxxorTestUtils.fakeFlux({ RedditStore: new RedditStore() });
  myStore = fakeFlux.store('RedditStore');
  myStoreSpy = fakeFlux.makeStoreEmitSpy('RedditStore');
});

describe('onUpdateUrl', function() {
  it('gets the best post (most upvotes) when the URL is changed', function() {
    myStore.reloadComments = jest.genMockFunction();
    fakeFlux.dispatcher.dispatch({ type: 'UPDATE_URL', payload: url });
    expect(myStore.getState().url).toBe(url);
    expect(myStore.getState().post.subreddit).toBe('programming');
    expect(myStore.reloadComments).toBeCalled();
  });
});

describe('onLogin', function() {
  it('opens an auth window on login and posts a message to the main window with auth credentials', function() {
    myStore.saveSession = jest.genMockFunction();
    var savedCallback;
    window.addEventListener = jest.genMockFunction().mockImplementation(function(type, callback) {
      savedCallback = callback;
    });
    window.open = jest.genMockFunction().mockImplementation(function() {
      savedCallback({ data: 'the_token' });
    });
    fakeFlux.dispatcher.dispatch({ type: 'LOGIN' });
    expect(myStore.getRedditAPI().auth).toBeCalledWith('the_token');
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
    expect(myStore.getState().userName).toBe('username');
  });
});

describe('onLogout', function() {
  it('clears the user name and revokes the token', function() {
    myStore.reloadComments = jest.genMockFunction();
    fakeFlux.dispatcher.dispatch({ type: 'LOGOUT' });
    // expect(myStore.getRedditAPI().deauth).toBeCalled(); // uncomment when `deauth` is supported properly
    expect(myStore.getState().userName).toBeNull();
    expect(myStore.reloadComments).toBeCalled();
  });
});

describe('onSubmitComment', function() {
  it('adds a new top-level comment when the parent is a post', function() {
    var payload  = {
      parent: { replies: [] },
      text: 'the_text',
      thing_id: '123'
    };
    myStore.getState().comments = [];
    fakeFlux.dispatcher.dispatch({ type: 'SUBMIT_COMMENT', payload: payload });
    expect(payload.parent.replies.length).toBe(0);
    expect(myStore.getState().comments.length).toBe(1);
    expect(myStore.getState().comments[0].id).toBe('cqbvxd1'); // From fixture file
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
  });

  it('add a new reply when the parent is a comment', function() {
    var payload  = {
      parent: { parent_id: '456', replies: [] },
      text: 'the_text',
      thing_id: '123'
    };
    myStore.getState().comments = [];
    fakeFlux.dispatcher.dispatch({ type: 'SUBMIT_COMMENT', payload: payload });
    expect(payload.parent.replies.length).toBe(1);
    expect(payload.parent.replies[0].id).toBe('cqbvxd1'); // From fixture file
    expect(myStore.getState().comments.length).toBe(0);
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
  });
});

describe('onVote', function() {
  it('decrements the score of a thing when it is downvoted', function() {
    var payload = {
      thing: { name: 'thing_name', likes: null, score: 10 },
      dir: -1
    };
    fakeFlux.dispatcher.dispatch({ type: 'VOTE', payload: payload });
    expect(payload.thing.likes).toBe(false);
    expect(payload.thing.score).toBe(9);
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
  });
  it('lowers the score of a thing by two when it goes from upvoted to downvoted', function() {
    var payload = {
      thing: { name: 'thing_name', likes: true, score: 10 },
      dir: -1
    };
    fakeFlux.dispatcher.dispatch({ type: 'VOTE', payload: payload });
    expect(payload.thing.likes).toBe(false);
    expect(payload.thing.score).toBe(8);
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
  });
  it('increments the score of a thing when it is upvoted', function() {
    var payload = {
      thing: { name: 'thing_name', likes: null, score: 10 },
      dir: 1
    };
    fakeFlux.dispatcher.dispatch({ type: 'VOTE', payload: payload });
    expect(payload.thing.likes).toBe(true);
    expect(payload.thing.score).toBe(11);
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
  });
  it('raises the score of a thing by two when it goes from downvoted to upvoted', function() {
    var payload = {
      thing: { name: 'thing_name', likes: false, score: 10 },
      dir: 1
    };
    fakeFlux.dispatcher.dispatch({ type: 'VOTE', payload: payload });
    expect(payload.thing.likes).toBe(true);
    expect(payload.thing.score).toBe(12);
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
  });
  it('decrements the score of a thing when it stops being upvoted', function() {
    var payload = {
      thing: { name: 'thing_name', likes: true, score: 10 },
      dir: 0
    };
    fakeFlux.dispatcher.dispatch({ type: 'VOTE', payload: payload });
    expect(payload.thing.likes).toBe(null);
    expect(payload.thing.score).toBe(9);
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
  });
  it('increments the score of a thing when it stops being downvoted', function() {
    var payload = {
      thing: { name: 'thing_name', likes: false, score: 10 },
      dir: 0
    };
    fakeFlux.dispatcher.dispatch({ type: 'VOTE', payload: payload });
    expect(payload.thing.likes).toBe(null);
    expect(payload.thing.score).toBe(11);
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
  });
});

describe('onEditComment', function() {
  it('modifies the comment body when it is edited', function() {
    var comment = { name: 'the_name', body: 'old_body' };
    var payload = { comment: comment, body: 'new_body' };
    fakeFlux.dispatcher.dispatch({ type: 'EDIT_COMMENT', payload: payload });
    expect(comment.body).toBe('new_body');
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
  });
});

describe('onDeleteComment', function() {
  it('changes the comment author and body to "[deleted"]', function() {
    var comment = { name: 'the_name', author: 'the_author', body: 'old_body' };
    fakeFlux.dispatcher.dispatch({ type: 'DELETE_COMMENT', payload: comment });
    expect(comment.author).toBe('[deleted]');
    expect(comment.body).toBe('[deleted]');
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
  });
});

describe('reloadComments', function() {
  it('does nothing if there is no post', function() {
    myStore.getState().post = null;
    myStore.getState().comments = null;
    myStore.reloadComments();
    expect(myStore.getState().comments).toBeNull();
  });
  it('loads the comments if there is a post', function() {
    myStore.getState().post = { id: '123' };
    myStore.getState().comments = null;
    myStore.reloadComments();
    expect(myStore.getState().post.id).toBe('2tpycj');
    expect(myStore.getState().comments.length).toBe(7);
    expect(myStore.getState().comments[0].id).toBe('co1f55g');
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
  });
});
