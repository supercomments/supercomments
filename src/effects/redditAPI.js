import Snoocore from 'snoocore';
import { Schema, normalize, arrayOf } from 'normalizr';
import { XmlEntities } from 'html-entities';
import moment from 'moment';
import * as Sort from 'constants/sort';
import * as Entities from 'constants/entities';

const MAP_SORT_TO_REDDIT_SORT = {
  [Sort.Best]: 'top',
  [Sort.Newest]: 'new',
  [Sort.Oldest]: 'old'
};

const MS_IN_SEC = 1000;

const htmlEntitiesDecoder = new XmlEntities();

const SCHEMA = {
  COMMENT: new Schema(Entities.Comment)
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
    scope: ['identity', 'read', 'submit', 'vote']
  }
});

const mapRedditReplies = replies => replies.map(({ data }) => ({
  id: data.id,
  thingId: data.name,
  parent: data.parent_id.substring(3),
  author: data.author,
  body: htmlEntitiesDecoder.decode(data.body_html),
  created: moment(data.created_utc * MS_IN_SEC),
  score: data.score,
  replies: data.replies ? mapRedditReplies(data.replies.data.children) : []
}));

const mapPost = (post, replies = []) => ({
  id: post.id,
  thingId: post.name,
  subreddit: `/r/${post.subreddit}`,
  replies,
  root: true
});

export const tokenExpiration = () => new Promise(res => {
  const cb = () => {
    reddit.removeListener('access_token_expired', cb);
    res();
  };

  reddit.on('access_token_expired', cb);
});

export const fetchComments = (postId, sort) =>
  reddit(`/comments/${postId}.json`)
    .get({ sort: MAP_SORT_TO_REDDIT_SORT[sort] })
    .then(([post, list]) => ({
      list: normalize(
        mapRedditReplies(list.data.children, post.data.children[0].data),
        arrayOf(SCHEMA.COMMENT)
      ),
      post: post.data.children[0].data
    }))
    .then(({ list: { entities, result }, post }) => {
      const rootComment = mapPost(post, result);

      const entitiesWithRoot = {
        ...entities,
        [Entities.Comment]: {
          ...entities[Entities.Comment],
          [rootComment.id]: rootComment
        }
      };

      return {
        list: {
          entities: entitiesWithRoot,
          result
        },
        post
      };
    });

export const submitComment = ({ thingId, text }) =>
  reddit('/api/comment')
    .post({
      text,
      thing_id: thingId
    })
    .then(({ json: { data } }) => {
      if (data.things && data.things.length > 0) {
        return normalize(mapRedditReplies(data.things)[0], SCHEMA.COMMENT);
      } else {
        throw new Error('Reddit API failed to submit the comment');
      }
    });

export const getAuthUrl = csrf => reddit.getImplicitAuthUrl(csrf);

export const authenticate = token => reddit
  .auth(token)
  .then(reddit('/api/v1/me').get);

export const logout = () => reddit.deauth();
