jest.dontMock('util');
jest.dontMock('../../app/components/CommentEditForm');
jest.dontMock('immutable');

var React, TestUtils, FluxxorTestUtils, Immutable, fakeFlux, MyComponent, itemState, myStore, component, onSubmit, comment;
beforeEach(function() {
  React = require('react/addons');
  TestUtils = React.addons.TestUtils;
  FluxxorTestUtils = require('fluxxor-test-utils').extendJasmineMatchers(this);
  Immutable = require('immutable');

  var RedditStore = require('../../app/stores/RedditStore');
  fakeFlux = FluxxorTestUtils.fakeFlux({ RedditStore: new RedditStore() }, require('../../app/actions/Actions'));
  fakeFlux.genMocksForStoresAndActions();

  MyComponent = require('../../app/components/CommentEditForm');
  comment = Immutable.fromJS({ body: 'old value' });

  myStore = fakeFlux.stores.RedditStore;
  itemState = {
    editBody: 'new value'
  };
  myStore.getItemState = jest.genMockFunction().mockImplementation(function() {
    return itemState;
  });

  var jsx = <MyComponent flux={fakeFlux} comment={comment} onSubmit={onSubmit}/>;
  component = TestUtils.renderIntoDocument(jsx);
});

describe('Initialization', function() {
  it('initializes to the value of the comment body', function() {
    expect(fakeFlux.actions.itemChanged).toBeCalledWith({ comment: comment, newState: { editBody: 'old value' }});
  });
});

describe('User input', function() {
  it('updates the component value when the textarea is changed', function() {
    var textarea = TestUtils.findRenderedDOMComponentWithTag(component, 'Textarea');
    TestUtils.Simulate.change(textarea, { target: { value: 'new value' }});
    expect(fakeFlux.actions.itemChanged).toBeCalledWith({ comment: comment, newState: { editBody: 'new value' }});
  });
});

describe('Saving and canceling', function() {
  it('saves the body and closes the form when saved', function() {
    var button = TestUtils.findRenderedDOMComponentWithTag(component, 'button');
    TestUtils.Simulate.click(button);
    expect(fakeFlux.actions.editComment).toBeCalledWith({ comment: comment, body: 'new value'});
    expect(fakeFlux.actions.itemChanged).toBeCalledWith({ comment: comment, newState: { editFormVisible: false }});
  });
  it('closes the form when saved', function() {
    var button = TestUtils.findRenderedDOMComponentWithTag(component, 'a');
    TestUtils.Simulate.click(button);
    expect(fakeFlux.actions.editComment).not.toBeCalled();
    expect(fakeFlux.actions.itemChanged).toBeCalledWith({ comment: comment, newState: { editFormVisible: false }});
  });
});
