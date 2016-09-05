import Snoocore from 'snoocore';
import { Schema, normalize, arrayOf } from 'normalizr';

const SCHEMA = {
  COMMENTS: new Schema('comments')
};

SCHEMA.COMMENTS.define({
  replies: arrayOf(SCHEMA.COMMENTS)
});

// TODO: proper snoocore init
const reddit = new Snoocore({
  userAgent: 'supercomments',
  oauth: {
    type: 'implicit',
    key: '_sty7RuHMXLIfA',
    redirectUri: 'http://localhost:3000',
    scope: ['identity', 'read', 'vote']
  }
});

const unwrapRedditReplies = replies => replies.map(({ data }) => ({
  ...data,
  replies: data.replies ? unwrapRedditReplies(data.replies.data.children) : []
}));

export const fetchComments = postId =>
  reddit(`/comments/${postId}.json`)
    .get()
    .then(([post, list]) => // eslint-disable-line no-unused-vars
        normalize(unwrapRedditReplies(list.data.children), arrayOf(SCHEMA.COMMENTS)));
