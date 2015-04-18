jest.dontMock('util');
jest.dontMock('../../app/stores/ItemStateStore');

var url = 'http://www.test.com/';

var FluxxorTestUtils, fakeFlux, myStore, myStoreSpy, item;
beforeEach(function() {
  FluxxorTestUtils = require('fluxxor-test-utils').extendJasmineMatchers(this);

  var ItemStateStore = require('../../app/stores/ItemStateStore');
  fakeFlux = FluxxorTestUtils.fakeFlux({ ItemStateStore: new ItemStateStore() });
  myStore = fakeFlux.store('ItemStateStore');
  myStoreSpy = fakeFlux.makeStoreEmitSpy('ItemStateStore');
  item = { id: '123' };
});

describe('onItemChanged', function() {
  it('creates a new state for the item if there is not one already', function() {
    fakeFlux.dispatcher.dispatch({ type: 'ITEM_CHANGED', payload: { item: item, newState: { property: 'value' }}});
    expect(myStore.getItemState(item)).toEqual({ property: 'value' });
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
  });
  it('extends the existing state', function() {
    myStore.state.items.set(item, { existing: 42 });
    fakeFlux.dispatcher.dispatch({ type: 'ITEM_CHANGED', payload: { item: item, newState: { property: 'value' }}});
    expect(myStore.getItemState(item)).toEqual({ existing: 42, property: 'value' });
    expect(myStoreSpy.getLastCall()).toEqual(['change']);
  });
});

describe('onItemRemoved', function() {
  it('removes the item', function() {
    myStore.state.items[item] = { existing: 42 };
    myStore.state.items.delete = jest.genMockFunction();
    fakeFlux.dispatcher.dispatch({ type: 'ITEM_REMOVED', payload: { item: item }});
    expect(myStore.state.items.delete).toBeCalled();
  });
});