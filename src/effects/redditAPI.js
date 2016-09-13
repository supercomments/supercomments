import Snoocore from 'snoocore';
import { Schema, normalize, arrayOf } from 'normalizr';
import { XmlEntities } from 'html-entities';
import moment from 'moment';
import * as Sort from 'constants/sort';
import { MsInSec } from 'constants/timing';
import * as Entities from 'constants/entities';

const MapSortToRedditSort = {
  [Sort.Best]: 'top',
  [Sort.Newest]: 'new',
  [Sort.Oldest]: 'old'
};

const htmlEntitiesDecoder = new XmlEntities();

const ApiSchema = {
  [Entities.Comment]: new Schema(Entities.Comment),
  [Entities.Post]: new Schema(Entities.Post)
};

ApiSchema[Entities.Comment].define({
  replies: arrayOf(ApiSchema[Entities.Comment])
});

ApiSchema[Entities.Post].define({
  comments: arrayOf(ApiSchema[Entities.Comment])
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
  name: data.name,
  upvoted: !!data.likes,
  downvoted: data.likes === false,
  votes: data.score,
  parent: data.parent_id.substring(3),
  author: data.author,
  body: htmlEntitiesDecoder.decode(data.body_html),
  created: moment(data.created_utc * MsInSec),
  replies: data.replies ? mapRedditReplies(data.replies.data.children) : []
}));

const mapRedditPost = (post, comments) => ({
  id: post.id,
  name: post.name,
  upvoted: !!post.likes,
  votes: post.score,
  subreddit: `/r/${post.subreddit}`,
  comments
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
    .get({ sort: MapSortToRedditSort[sort] })
    .then(([post, list]) => ({
      comments: mapRedditReplies(list.data.children, post.data.children[0].data),
      post: post.data.children[0].data
    }))
    .then(({ comments, post }) => {
      const {
        entities,
        result
      } = normalize(mapRedditPost(post, comments), ApiSchema[Entities.Post]);

      return {
        entities,
        result
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
        return normalize(mapRedditReplies(data.things)[0], ApiSchema[Entities.Comment]);
      } else {
        throw new Error('Reddit API failed to submit the comment');
      }
    });

export const getAuthUrl = csrf => reddit.getImplicitAuthUrl(csrf);

export const authenticate = token => reddit
  .auth(token)
  .then(reddit('/api/v1/me').get);

export const logout = () => reddit.deauth();
