jest.dontMock('fluxxor-test-utils');
jest.dontMock('../../app/components/CommentForm');

var React, TestUtils, FluxxorTestUtils, Immutable, fakeFlux, MyComponent, component, onSubmit, state, comment, itemState;
beforeEach(function() {
  React = require('react/addons');
  TestUtils = React.addons.TestUtils;
  FluxxorTestUtils = require('fluxxor-test-utils').extendJasmineMatchers(this);
  Immutable = require('immutable');

  var RedditStore = require('../../app/stores/RedditStore');
  fakeFlux = FluxxorTestUtils.fakeFlux({ RedditStore: new RedditStore(), }, require('../../app/actions/Actions'));
  fakeFlux.genMocksForStoresAndActions();
});

describe('When logged in on a page that has a post', function() {
  beforeEach(function() {
    state = {
      post: Immutable.fromJS({ id: 'some_id', body: 'old post' }),
      userName: 'the user'
    };
    fakeFlux.stores.RedditStore.getState = jest.genMockFunction().mockImplementation(function() {
      return state;
    });
    itemState = {
      formExpanded: true,
      replyBody: 'new value'
    };
    fakeFlux.stores.RedditStore.getItemState = jest.genMockFunction().mockImplementation(function() {
      return itemState;
    });
  });
  describe('Replying to a comment', function() {
    beforeEach(function() {
      MyComponent = require('../../app/components/CommentForm');
      comment = Immutable.fromJS({
        body: 'old value'
      });
      var jsx = <MyComponent flux={fakeFlux} comment={comment} onSubmit={onSubmit}/>;
      component = TestUtils.renderIntoDocument(jsx);
    });

    it('updates the component value when the textarea is changed', function() {
      var textarea = TestUtils.findRenderedDOMComponentWithTag(component, 'Textarea');
      TestUtils.Simulate.change(textarea, { target: { value: 'new value' }});
      expect(fakeFlux.actions.itemChanged).toBeCalledWith({ comment: comment, newState: { replyBody: 'new value' }});
    });

    it('saves the reply and closes the form when saved', function() {
      var button = TestUtils.findRenderedDOMComponentWithTag(component, 'button');
      TestUtils.Simulate.click(button);
      expect(fakeFlux.actions.submitComment).toBeCalledWith({ parent: comment, body: 'new value'});
    });
  });
  describe('Replying to a post', function() {
    beforeEach(function() {
      MyComponent = require('../../app/components/CommentForm');
      var jsx = <MyComponent flux={fakeFlux} onSubmit={onSubmit}/>;
      component = TestUtils.renderIntoDocument(jsx);
    });
    it('saves the reply and closes the form when saved', function() {
      var textarea = TestUtils.findRenderedDOMComponentWithTag(component, 'Textarea');
      TestUtils.Simulate.change(textarea, { target: { value: 'new value' }});
      var button = TestUtils.findRenderedDOMComponentWithTag(component, 'button');
      TestUtils.Simulate.click(button);
      expect(fakeFlux.actions.submitComment).toBeCalledWith({ parent: undefined, body: 'new value'});
    });
  });
});
