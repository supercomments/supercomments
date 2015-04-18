jest.dontMock('util');
jest.dontMock('../../app/components/CommentEditForm');

var React, TestUtils, FluxxorTestUtils, fakeFlux, MyComponent, component, onSubmit, item;
beforeEach(function() {
  React = require('react/addons');
  TestUtils = React.addons.TestUtils;

  FluxxorTestUtils = require('fluxxor-test-utils').extendJasmineMatchers(this);

  var RedditStore = require('../../app/stores/RedditStore');
  fakeFlux = FluxxorTestUtils.fakeFlux({ myStore: new RedditStore() }, require('../../app/actions/Actions'));
  fakeFlux.genMocksForStoresAndActions();

  MyComponent = require('../../app/components/CommentEditForm');
  item = {
    props: { comment: { body: 'old value' }}
  };
  var jsx = <MyComponent flux={fakeFlux} item={item} onSubmit={onSubmit}/>;
  component = TestUtils.renderIntoDocument(jsx);
});

describe('Initialization', function() {
  it('initializes to the value of the comment body', function() {
    expect(component.state.body).toBe('old value');
  });
});

describe('User input', function() {
  it('updates the component value when the textarea is changed', function() {
    var textarea = TestUtils.findRenderedDOMComponentWithTag(component, 'Textarea');
    TestUtils.Simulate.change(textarea, { target: { value: 'new value' }});
    expect(component.state.body).toBe('new value');
  });
});

describe('Saving and canceling', function() {
  it('saves the body and closes the form when saved', function() {
    var textarea = TestUtils.findRenderedDOMComponentWithTag(component, 'Textarea');
    TestUtils.Simulate.change(textarea, { target: { value: 'new value' }});
    var button = TestUtils.findRenderedDOMComponentWithTag(component, 'button');
    TestUtils.Simulate.click(button);
    expect(fakeFlux.actions.editComment).toBeCalledWith({ comment: item.props.comment, body: 'new value'});
    expect(fakeFlux.actions.itemChanged).toBeCalledWith({ item: item, newState: { editFormVisible: false}});
  });
  it('closes the form when saved', function() {
    var button = TestUtils.findRenderedDOMComponentWithTag(component, 'a');
    TestUtils.Simulate.click(button);
    expect(fakeFlux.actions.editComment).not.toBeCalled();
    expect(fakeFlux.actions.itemChanged).toBeCalledWith({ item: item, newState: { editFormVisible: false}});
  });
});
