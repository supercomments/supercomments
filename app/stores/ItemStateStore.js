'use strict';

var Fluxxor = require('fluxxor');
var Constants = require('../constants/Constants');

var ItemStateStore = Fluxxor.createStore({
  initialize: function() {
    this.state = {
      items: new WeakMap()
    };
    this.bindActions(
      Constants.ITEM_CHANGED, this.onItemChanged,
      Constants.ITEM_REMOVED, this.onItemRemoved
    );
  },

  onItemChanged: function(payload) {
    var item = payload.item;
    var newState = payload.newState;
    var state = this.getItemState(item);
    Object.keys(newState).forEach((key) => {
      state[key] = newState[key];
    });
    this.state.items.set(item, state);
    this.emit('change');
  },

  onItemRemoved: function(item) {
    this.state.items.delete(item);
  },

  getItemState: function(item) {
    if (this.state.items.has(item)) {
      return this.state.items.get(item);
    }
    else {
      return {};
    }
  }
});

module.exports = ItemStateStore;
