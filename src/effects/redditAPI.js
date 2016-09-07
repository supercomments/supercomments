import Snoocore from 'snoocore';
import { Schema, normalize, arrayOf } from 'normalizr';
import { XmlEntities } from 'html-entities';
import moment from 'moment';

const MS_IN_SEC = 1000;

const htmlEntitiesDecoder = new XmlEntities();

const SCHEMA = {
  COMMENT: new Schema('comments')
};

SCHEMA.COMMENT.define({
  replies: arrayOf(SCHEMA.COMMENT)
});

// TODO: proper snoocore init
const reddit = new Snoocore({
  userAgent: 'supercomments',
  oauth: {
    type: 'implicit',
    key: 'CRcRenqfbTCNLw',
    redirectUri: 'http://localhost:3000',
    scope: ['identity', 'read', 'vote']
  }
});

const mapRedditReplies = (replies, parent = null) => replies.map(({ data }) => ({
  id: data.id,
  parentAuthor: parent ? parent.author : null,
  author: data.author,
  body: htmlEntitiesDecoder.decode(data.body_html),
  created: moment(data.created * MS_IN_SEC),
  score: data.score,
  replies: data.replies ? mapRedditReplies(data.replies.data.children, data) : []
}));

export const fetchComments = postId =>
  reddit(`/comments/${postId}.json`)
    .get()
    .then(([post, list]) => // eslint-disable-line no-unused-vars
        normalize(mapRedditReplies(list.data.children), arrayOf(SCHEMA.COMMENT)));

export const getAuthUrl = csrf => reddit.getImplicitAuthUrl(csrf);

export const authenticate = token => reddit
  .auth(token)
  .then(reddit('/api/v1/me').get);
