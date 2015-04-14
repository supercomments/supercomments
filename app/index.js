var React = require('react');
var Bootstrap = require('bootstrap');
var Fluxxor = require('fluxxor');
var Comments = require('./components/comments');
var Actions = require('./actions/actions');
var RedditStore = require('./stores/redditStore');

var stores = {
  RedditStore: new RedditStore()
};

var flux = new Fluxxor.Flux(stores, Actions);

window.React = React; // For React Developer Tools
window.flux = flux;

var url = window.location.search.substr(1);

flux.actions.updateUrl(url);

if (process.env.NODE_ENV !== 'test') {
  React.render(
    <Comments flux={flux}/>,
    document.getElementById('layout')
  );
}