jest.dontMock('util');
jest.dontMock('../../app/components/CommentList');
jest.dontMock('immutable');
jest.dontMock('immutable/contrib/cursor');

var React, Immutable, TestUtils, FluxxorTestUtils, fakeFlux, MyComponent;
beforeEach(function() {
  React = require('react/addons');
  Immutable = require('immutable');
  TestUtils = React.addons.TestUtils;

  FluxxorTestUtils = require('fluxxor-test-utils').extendJasmineMatchers(this);

  var RedditStore = require('../../app/stores/RedditStore');
  fakeFlux = FluxxorTestUtils.fakeFlux({ RedditStore: new RedditStore() }, require('../../app/actions/Actions'));
  fakeFlux.genMocksForStoresAndActions();
});

describe('Comment mapping', function() {
  it('maps the comments into children in the DOM', function() {
    var state = {
      comments: Immutable.fromJS([
        { id: '1', author: 'foo', replies: [] },
        { id: '2', author: 'bar', replies: [{ id: '3', replies: [] }, { id: '4', replies: [] }]},
        { id: '5', replies: [] }
      ])
    };
    fakeFlux.stores.RedditStore.getState = jest.genMockFunction().mockImplementation(function() {
      return state;
    });
    fakeFlux.stores.RedditStore.replaceComments = jest.genMockFunction();
    MyComponent = require('../../app/components/CommentList');
    var shadowRenderer = TestUtils.createRenderer();
    shadowRenderer.render(<MyComponent flux={fakeFlux}/>, {});
    var component = shadowRenderer.getRenderOutput();
    var commentNodes = component.props.children;
    expect(commentNodes.length).toBe(3);
    expect(commentNodes[0].props.comment.get('id')).toBe('1');
    expect(commentNodes[0].props.comment.get('parentAuthor')).toBeUndefined();
    expect(commentNodes[1].props.children.length).toBe(2);
    expect(commentNodes[1].props.children[1].props.comment.get('id')).toBe('4');
    expect(commentNodes[1].props.children[1].props.parentAuthor).toBe('bar');
    expect(commentNodes[2].props.comment.get('id')).toBe('5');
  });
});
