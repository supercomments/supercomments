import { merge } from 'lodash';

import identityFunction from 'helpers/identityFunction';
import * as Actions from 'constants/actions';
import * as Entities from 'constants/entities';

const initialState = {
  [Entities.Comment]: {},
  [Entities.Post]: {}
};

const updateEntity = (state, type, mutation = identityFunction) => ({
  ...state,
  [type]: mutation(state[type])
});

export default (state = initialState, { type, payload }) => {
  switch (type) {
    case Actions.EntitiesHaveChanged:
      return merge({}, state, payload);

    case Actions.CreateEntity: {
      const { entityType, entity } = payload;
      let stateReference = state;

      // Comments form a tree, we need to link
      // newly created Comment to the parent
      if (entityType === Entities.Comment) {
        if (stateReference[Entities.Post][entity.parent]) {
          stateReference = updateEntity(stateReference, Entities.Post, posts => ({
            ...posts,
            [entity.parent]: {
              ...posts[entity.parent],
              comments: [
                ...posts[entity.parent].comments,
                entity.id
              ]
            }
          }));
        } else {
          stateReference = updateEntity(stateReference, Entities.Comment, comments => ({
            ...comments,
            [entity.parent]: {
              ...comments[entity.parent],
              replies: [
                ...comments[entity.parent].replies,
                entity.id
              ]
            }
          }));
        }
      }

      return updateEntity(stateReference, entityType, entities => ({
        ...entities,
        [entity.id]: entity
      }));
    }

    case Actions.DeleteEntity: {
      const { entityType, id } = payload;
      let stateReference = state;

      if (entityType === Entities.Comment) {
        const comment = state[Entities.Comment][id];

        if (state[Entities.Post][comment.parent]) {
          stateReference = updateEntity(state, Entities.Post, posts => ({
            ...posts,
            [comment.parent]: {
              ...posts[comment.parent],
              comments: posts[comment.parent].comments.filter(replyId => replyId !== id)
            }
          }));
        } else {
          stateReference = updateEntity(state, Entities.Comment, comments => ({
            ...comments,
            [comment.parent]: {
              ...comments[comment.parent],
              replies: comments[comment.parent].replies.filter(replyId => replyId !== id)
            }
          }));
        }
      }

      return updateEntity(stateReference, entityType, entities => {
        const entitiesCopy = { ...entities };
        delete entitiesCopy[id];
        return entitiesCopy;
      });
    }

    default:
      return state;
  }
};
