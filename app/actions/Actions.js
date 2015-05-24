let Constants = require('../constants/Constants');
let FormMessages = require('../constants/FormMessages');
let Snoocore = require('snoocore');
let shortid = require('shortid');
let url = require('url');

const USER_AGENT = 'Supercomments';
const AUTH_WINDOW_WIDTH = 1024;
const AUTH_WINDOW_HEIGHT = 800;
const AUTH_TIMEOUT_MS = 3600*1000;

function createAPI(consumerKey, redirectUri) {
  return new Snoocore({
    userAgent: USER_AGENT,
    oauth: {
      type: 'implicit',
      key: consumerKey,
      redirectUri: redirectUri,
      scope: [ 'identity', 'read', 'submit', 'vote', 'edit', 'report' ]
    }
  });
}

let reddit;
function getRedditAPI(flux) {
  if (!reddit) {
    let store = flux.store('RedditStore');
    reddit = createAPI(store.getState().consumerKey, store.getState().redirectUri);
    reddit.on('access_token_expired', flux.actions.logout);
  }
  return reddit;
}

function getBestRedditPost(flux, postUrl) {
  return getRedditAPI(flux)('search.json').get({ q: 'url:' + postUrl }).then((listing) => {
    let sortedPosts = listing.data.children.sort((a, b) => {
      // Descending order
      return b.data.score - a.data.score;
    });
    return sortedPosts.length > 0 ? sortedPosts[0].data : null;
  });
}

function saveSession(token, userName) {
  let supercomments = localStorage.supercomments ? JSON.parse(localStorage.supercomments) : {};
  if (!supercomments.reddit) {
    supercomments.reddit = {};
  }
  supercomments.reddit.token = token;
  supercomments.reddit.userName = userName;
  supercomments.reddit.timestamp = Date.now();
  localStorage.supercomments = JSON.stringify(supercomments);
}

function restoreSession(flux) {
  if (localStorage.supercomments) {
    let supercomments = JSON.parse(localStorage.supercomments);
    if (supercomments.reddit && supercomments.reddit.token) {
      if (Date.now() - supercomments.reddit.timestamp < AUTH_TIMEOUT_MS) {
        getRedditAPI(flux).auth(supercomments.reddit.token);
        return supercomments.reddit.userName;
      }
    }
  }
  // Null signals that no session was restored
  return null;
}

let Actions = {
  updateUrl(payload) {
    let postUrl = payload.url;
    this.dispatch(Constants.UPDATING_URL, payload);
    let store = this.flux.store('RedditStore');
    if (!store.getState().userName) {
      let userName = restoreSession(this.flux);
      if (userName) {
        this.dispatch(Constants.LOGGED_IN, { userName: userName, unreadCount: 0 });
      }
    }
    getBestRedditPost(this.flux, postUrl).then((post) => {
      return { reddit: post };
    })
    .then((value) => {
      this.dispatch(Constants.UPDATED_URL, value);
      this.flux.actions.reloadComments({ post: store.getState().post, sortBy: 'best' });
    });
  },

  login() {
    let createLoginMessageListener = function(csrf, dispatch, flux) {
      // Used so the OAuth popup can tell us when the user has authenticated
      return function messageListener(event) {
        let data = event.data;
        if ((typeof(data) === 'object') && ('token' in data) && ('state' in data) && (data.state === csrf)) {
          let token = data.token;
          dispatch(Constants.LOGGING_IN);
          getRedditAPI(flux).auth(token).then(() => {
            return getRedditAPI(flux)('/api/v1/me').get();
          })
          .then((data) => {
            let userName = data.name;
            dispatch(Constants.LOGGED_IN, { userName: userName, unreadCount: data.inbox_count });
            saveSession(token, userName);

            let store = flux.store('RedditStore');
            flux.actions.reloadComments({ post: store.getState().post, sortBy: store.getState().sortBy });
          });
        }
        window.removeEventListener('message', messageListener, false);
      };
    };

    let state = shortid.generate(); // CSRF
    let authUrl = getRedditAPI(this.flux).getImplicitAuthUrl(state);

    window.addEventListener('message', createLoginMessageListener(state, this.dispatch, this.flux), false);
    window.open(authUrl, 'RedditAuth', `height=${AUTH_WINDOW_HEIGHT},width=${AUTH_WINDOW_WIDTH}`);
  },

  logout() {
    getRedditAPI(this.flux).deauth().then(() => {
      delete localStorage.supercomments;
      this.dispatch(Constants.LOGOUT);
      let store = this.flux.store('RedditStore');
      this.flux.actions.reloadComments({ post: store.getState().post, sortBy: store.getState().sortBy });
    });
  },

  clearUnreadCount() {
    this.dispatch(Constants.UNREAD_MESSAGES_READ);
  },

  submitComment(payload) {
    this.flux.actions.itemChanged({ comment: payload.parent, newState: { postMessage: null, submitPending: true }});

    let store = this.flux.store('RedditStore');
    if (!payload.body) {
      this.flux.actions.itemChanged({
        comment: payload.parent,
        newState: { postMessage: FormMessages.COMMENT_EMPTY, submitPending: false }
      });
    }
    else if (!store.getState().post && !payload.secondChance) {
      // Post might have been added since we loaded the page, so try to get it
      return getBestRedditPost(this.flux, store.getState().url).then((post) => {
        this.dispatch(Constants.UPDATED_URL, { reddit: post });
        payload.secondChance = true;
        this.flux.actions.submitComment(payload);
      });
    }
    else if (!store.getState().post) {
      this.flux.actions.itemChanged({
        comment: payload.parent,
        newState: { postMessage: FormMessages.PAGE_NOT_SUBMITTED, submitPending: false }
      });
    }
    else {
      this.flux.actions.itemChanged({
        comment: payload.parent,
        newState: { replyFormVisible: false, formExpanded: false, replyBody: '', submitPending: false }
      });

      let tempId = shortid.generate();
      this.dispatch(Constants.SUBMITTING_COMMENT, Object.assign({ id: tempId }, payload));

      let parent = payload.parent ? payload.parent : this.flux.store('RedditStore').getState().post;

      getRedditAPI(this.flux)('/api/comment').post({
        text: payload.body,
        thing_id: parent.get('name')
      }).then((result) => {
        if (result.json.data.things && result.json.data.things.length > 0) {
          let comment = result.json.data.things[0].data;
          this.dispatch(Constants.SUBMITTED_COMMENT, { id: tempId, comment: comment });
        }
      });
    }
  },

  vote(payload) {
    let thing = payload.thing;
    this.dispatch(Constants.VOTING, payload);
    getRedditAPI(this.flux)('/api/vote').post({
      id: thing.get('name'),
      dir: payload.dir
    }).then(() => {
      this.dispatch(Constants.VOTED, thing);
    });
  },

  reloadComments(payload) {
    this.dispatch(Constants.RELOADING_COMMENTS);
    if (payload.post) {
      getRedditAPI(this.flux)('comments/' + payload.post.get('id') + '.json').get({ sort: payload.sortBy }).then((listings) => {
        this.dispatch(Constants.RELOADED_COMMENTS, { post: listings[0].data.children[0].data, comments: listings[1] });
      });
    }
    else {
      this.dispatch(Constants.RELOADED_COMMENTS, null);
    }
  },

  sortByBest() {
    this.dispatch(Constants.SORT_BY_BEST);
    let store = this.flux.store('RedditStore');
    this.flux.actions.reloadComments({ post: store.getState().post, sortBy: store.getState().sortBy });
  },

  sortByNewest() {
    this.dispatch(Constants.SORT_BY_NEWEST);
    let store = this.flux.store('RedditStore');
    this.flux.actions.reloadComments({ post: store.getState().post, sortBy: store.getState().sortBy });
  },

  sortByOldest() {
    this.dispatch(Constants.SORT_BY_OLDEST);
    let store = this.flux.store('RedditStore');
    this.flux.actions.reloadComments({ post: store.getState().post, sortBy: store.getState().sortBy });
  },

  editComment(payload) {
    let comment = payload.comment;
    this.dispatch(Constants.EDITING_COMMENT, payload);
    getRedditAPI(this.flux)('/api/editusertext').post({
      thing_id: comment.get('name'),
      text: payload.body
    }).then(() => {
      this.dispatch(Constants.EDITED_COMMENT, comment);
    });
  },

  deleteComment(comment) {
    this.dispatch(Constants.DELETING_COMMENT, comment);
    getRedditAPI(this.flux)('/api/del').post({
      id: comment.get('name'),
    }).then(() => {
      this.dispatch(Constants.DELETED_COMMENT, comment);
    });
  },

  reportComment(comment) {
    this.dispatch(Constants.REPORTING_COMMENT, comment);
    // TODO: currently getting a 403 for this, need to investigate
    getRedditAPI(this.flux)('/api/report').post({
      thing_id: comment.get('name'),
      reason: 'other',
      other_reason: 'inappropriate (reported via Supercomments)'
    }).then(() => {
      this.dispatch(Constants.REPORTED_COMMENT, comment);
    });
  },

  itemChanged(payload) {
    this.dispatch(Constants.ITEM_CHANGED, payload);
  },

  setTooltip(tooltip) {
    this.dispatch(Constants.SET_TOOLTIP, tooltip);
  },

  hideTooltip() {
    this.dispatch(Constants.SET_TOOLTIP, null);
  }
};

module.exports = Actions;