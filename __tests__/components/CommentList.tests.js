jest.dontMock('util');
jest.dontMock('../../app/components/CommentList');

var React, TestUtils, FluxxorTestUtils, fakeFlux, MyComponent;
beforeEach(function() {
  React = require('react/addons');
  TestUtils = React.addons.TestUtils;

  FluxxorTestUtils = require('fluxxor-test-utils').extendJasmineMatchers(this);

  var RedditStore = require('../../app/stores/RedditStore');
  fakeFlux = FluxxorTestUtils.fakeFlux({ RedditStore: new RedditStore() }, require('../../app/actions/Actions'));
  fakeFlux.genMocksForStoresAndActions();
});

describe('Comment mapping', function() {
  it('maps the comments into children in the DOM', function() {
    var state = {
      comments: [
        { id: '1', author: 'foo' },
        { id: '2', author: 'bar', replies: [{ id: '3' }, { id: '4' }]},
        { id: '5' }
      ]
    };
    fakeFlux.stores.RedditStore.getState = jest.genMockFunction().mockImplementation(function() {
      return state;
    });
    MyComponent = require('../../app/components/CommentList');
    var shadowRenderer = TestUtils.createRenderer();
    // Currently it is failing to shadow render the component.
    // See https://github.com/facebook/react/issues/3696
    shadowRenderer.render(<MyComponent flux={fakeFlux}/>, {});
    var component = shadowRenderer.getRenderOutput();
    var commentNodes = component.props.children;
    expect(commentNodes.length).toBe(3);
    expect(commentNodes[0].props.comment.id).toBe('1');
    expect(commentNodes[0].props.comment.parentAuthor).toBeUndefined();
    expect(commentNodes[1].props.children.length).toBe(2);
    expect(commentNodes[1].props.children[1].props.comment.id).toBe('4');
    expect(commentNodes[1].props.children[1].props.parentAuthor).toBe('bar');
    expect(commentNodes[2].props.comment.id).toBe('5');
  });
});
