require('babel/polyfill');
require('bootstrap');

var React = require('react');
var Fluxxor = require('fluxxor');
var Comments = require('./components/Comments');
var Actions = require('./actions/Actions');

var RedditStore = require('./stores/RedditStore');
var stores = {
  RedditStore: new RedditStore()
};

var flux = new Fluxxor.Flux(stores, Actions);

var config = JSON.parse(atob(frameElement.getAttribute('data-config')));

flux.actions.updateUrl({ url: config.url, config: { reddit: config.reddit, disqus: config.disqus }});
if (process.env.NODE_ENV !== 'test') {
  React.render(
    <Comments flux={flux}/>,
    document.getElementById('supercomments')
  );
}
