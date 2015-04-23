jest.dontMock('util');
jest.dontMock('../../app/components/CommentEditForm');

var React, TestUtils, FluxxorTestUtils, fakeFlux, MyComponent, itemState, myStore, component, onSubmit, comment;
beforeEach(function() {
  React = require('react/addons');
  TestUtils = React.addons.TestUtils;

  FluxxorTestUtils = require('fluxxor-test-utils').extendJasmineMatchers(this);

  var ItemStateStore = require('../../app/stores/ItemStateStore');
  fakeFlux = FluxxorTestUtils.fakeFlux({ ItemStateStore: new ItemStateStore() }, require('../../app/actions/Actions'));
  fakeFlux.genMocksForStoresAndActions();

  MyComponent = require('../../app/components/CommentEditForm');
  comment = { body: 'old value' };

  myStore = fakeFlux.stores.ItemStateStore;
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
