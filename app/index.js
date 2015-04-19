require("babelify/polyfill");
require('bootstrap');

var React = require('react');
var Fluxxor = require('fluxxor');
var Comments = require('./components/Comments');
var Actions = require('./actions/Actions');
var RedditStore = require('./stores/RedditStore');
var ItemStateStore = require('./stores/ItemStateStore');
var stores = {
  RedditStore: new RedditStore(),
  ItemStateStore: new ItemStateStore()
};

var flux = new Fluxxor.Flux(stores, Actions);

var url = window.location.search.substr(1);

flux.actions.updateUrl(url);

if (process.env.NODE_ENV !== 'test') {
  React.render(
    <Comments flux={flux}/>,
    document.getElementById('layout')
  );
}