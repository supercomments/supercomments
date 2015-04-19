jest.dontMock('util');
jest.dontMock('../../app/components/CommentForm');

var React, TestUtils, FluxxorTestUtils, fakeFlux, MyComponent, component, onSubmit, state, item;
beforeEach(function() {
  React = require('react/addons');
  TestUtils = React.addons.TestUtils;

  FluxxorTestUtils = require('fluxxor-test-utils').extendJasmineMatchers(this);

  var RedditStore = require('../../app/stores/RedditStore');
  fakeFlux = FluxxorTestUtils.fakeFlux({ RedditStore: new RedditStore() }, require('../../app/actions/Actions'));
  fakeFlux.genMocksForStoresAndActions();
});

describe('When logged in on a page that has a post', function() {
  beforeEach(function() {
    state = {
      post: { id: 'some_id' },
      userName: 'the user'
    };
    fakeFlux.stores.RedditStore.getState = jest.genMockFunction().mockImplementation(function() {
      return state;
    });
  });
  describe('Replying to a comment', function() {
    beforeEach(function() {
      MyComponent = require('../../app/components/CommentForm');
      item = {
        props: { comment: { body: 'old value' }}
      };
      var jsx = <MyComponent flux={fakeFlux} item={item} onSubmit={onSubmit}/>;
      component = TestUtils.renderIntoDocument(jsx);
    });
    it('initializes to an empty string', function() {
      expect(component.state.body).toBe('');
    });

    it('updates the component value when the textarea is changed', function() {
      var textarea = TestUtils.findRenderedDOMComponentWithTag(component, 'Textarea');
      TestUtils.Simulate.change(textarea, { target: { value: 'new value' }});
      expect(component.state.body).toBe('new value');
    });

    it('saves the reply and closes the form when saved', function() {
      var textarea = TestUtils.findRenderedDOMComponentWithTag(component, 'Textarea');
      TestUtils.Simulate.change(textarea, { target: { value: 'new value' }});
      var button = TestUtils.findRenderedDOMComponentWithTag(component, 'button');
      TestUtils.Simulate.click(button);
      expect(fakeFlux.actions.submitComment).toBeCalledWith({ parent: item.props.comment, body: 'new value'});
      expect(fakeFlux.actions.itemChanged).toBeCalledWith({ item: item, newState: { replyFormVisible: false}});
    });

    it('does not submit the reply when the comment is empty', function() {
      var button = TestUtils.findRenderedDOMComponentWithTag(component, 'button');
      TestUtils.Simulate.click(button);
      expect(component.state.postError).toBe(component.FormErrors.COMMENT_EMPTY);
      expect(fakeFlux.actions.submitComment).not.toBeCalled();
      expect(fakeFlux.actions.itemChanged).not.toBeCalled();

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
      expect(fakeFlux.actions.submitComment).toBeCalledWith({ parent: state.post, body: 'new value'});
      expect(fakeFlux.actions.itemChanged).not.toBeCalled();
    });
  });
});

describe('When logged in on a page that does not have a post', function() {
  beforeEach(function() {
    state = {
      post: null,
      userName: 'the user'
    };
    fakeFlux.stores.RedditStore.getState = jest.genMockFunction().mockImplementation(function() {
      return state;
    });
  });
  describe('Replying to a comment', function() {
    beforeEach(function() {
      MyComponent = require('../../app/components/CommentForm');
      item = {
        props: { comment: { body: 'old value' }}
      };
      var jsx = <MyComponent flux={fakeFlux} item={item} onSubmit={onSubmit}/>;
      component = TestUtils.renderIntoDocument(jsx);
    });
    it('does not save the reply when the form is submitted', function() {
      var textarea = TestUtils.findRenderedDOMComponentWithTag(component, 'Textarea');
      TestUtils.Simulate.change(textarea, { target: { value: 'new value' }});
      var button = TestUtils.findRenderedDOMComponentWithTag(component, 'button');
      TestUtils.Simulate.click(button);
      expect(component.state.postError).toBe(component.FormErrors.PAGE_NOT_SUBMITTED);
      expect(fakeFlux.actions.submitComment).not.toBeCalled();
      expect(fakeFlux.actions.itemChanged).not.toBeCalled();
    });
  });
});
