jest.dontMock('util');
jest.dontMock('../../app/stores/ItemStateStore');

var url = 'http://www.test.com/';

var FluxxorTestUtils, fakeFlux, myStore, myStoreSpy, comment;
beforeEach(function() {
  FluxxorTestUtils = require('fluxxor-test-utils').extendJasmineMatchers(this);

  var ItemStateStore = require('../../app/stores/ItemStateStore');
  fakeFlux = FluxxorTestUtils.fakeFlux({ ItemStateStore: new ItemStateStore() });
  myStore = fakeFlux.store('ItemStateStore');
  myStoreSpy = fakeFlux.makeStoreEmitSpy('ItemStateStore');
  comment = { id: '123' };
});

describe('onItemChanged', function() {
  beforeEach(function() {
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

describe('onItemRemoved', function() {
  it('removes the item', function() {
    myStore.state.comments[comment] = { existing: 42 };
    myStore.state.comments.delete = jest.genMockFunction();
    fakeFlux.dispatcher.dispatch({ type: 'ITEM_REMOVED', payload: { comment: comment }});
    expect(myStore.state.comments.delete).toBeCalled();
  });
});