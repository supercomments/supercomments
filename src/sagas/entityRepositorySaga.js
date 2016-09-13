import { call, put, select } from 'redux-saga/effects';

import * as Actions from 'constants/actions';
import buildAction from 'helpers/buildAction';
import { waitFor } from 'sagas/helpers';
import { getEntity } from 'selectors/entityRepositorySelectors';

/**
 * Optimistically creats an entity in Entity repository. When API effect fails,
 * it just removes the entity.
 *
 * @param {String} type of the entity in the EntityRepository
 * @param {Effect} Effect to be called which executes the API call
 * @param {Generator} Generator function which returns the entity to be created
 *                    it's generator so that user can do any necessary initialization
 *                    for example getting data from app state.
 * @param {Function} Extracts parameters for the apiCallEffect (eg. from newly created entity)
 * @param {Generator} onRollback hook, user for example enable re-try button
 * @param {Function} A selector which determines which is the specific retry action
 *                   for this particular transaction
 */
export function* optimisticallyCreateEntity(
  entityType,
  apiCallEffect,
  createEntity,
  extractEffectParams,
  onRollback,
  retrySelector
) {
  const transientId = `transient-${Date.now().toString()}`;

  while (true) {
    // Let's wait for new entity
    const entity = yield* createEntity();

    // Enhance the entity with metadata
    // it's important to mark the entity as transient
    // so that we can disable any API actions,
    // also generated ID is mandatory
    const entityWithId = {
      ...entity,
      id: transientId,
      transient: true
    };

    // try/catch holds everything within a transaction
    try {
      // Create transient entity, so that user can see
      // the entity immediately
      yield put(buildAction(Actions.CreateEntity, {
        entityType,
        entity: entityWithId
      }));

      // Call the API ane expect normalizr result
      const {
        entities,
        result
      } = yield call(apiCallEffect, extractEffectParams(entity));

      // If the API proceeded sucessfuly, we can just delete
      // the transient entity
      yield put(buildAction(Actions.DeleteEntity, {
        entityType,
        id: transientId
      }));

      // And of course Create the real one.
      yield put(buildAction(Actions.CreateEntity, {
        entityType,
        entity: entities[entityType][result]
      }));

      return;
    } catch (ex) {
      console.warn('An error while trying to optimistically create an entity has occurred', ex);

      // In case of error just delete the transient entity
      yield put(buildAction(Actions.DeleteEntity, {
        entityType,
        id: transientId
      }));

      // The API should allow reacting on the fact that something went wrong
      // for example displaying Retry button
      yield* onRollback(entity);

      // Now let's wait for appropriate Retry action
      yield* waitFor(Actions.Retry, retrySelector);
    }
  }
}

export function* optimisticallUpdateEntity(
  id,
  entityType,
  updateEffect,
  createEntity,
  extractEffectParams
) {
  const originalEntity = yield select(appState => getEntity(appState, entityType, id));

  try {
    const mutatedEntity = yield* createEntity();

    yield put(buildAction(Actions.UpdateEntity, {
      id,
      entityType,
      entity: {
        ...mutatedEntity,
        transient: true
      }
    }));

    yield call(updateEffect, extractEffectParams(mutatedEntity));

    yield put(buildAction(Actions.CommitEntity, {
      id,
      entityType
    }));
  } catch (ex) {
    console.warn('An error while trying to optimistically update an entity has occurred', ex);

    yield put(buildAction(Actions.UpdateEntity, {
      id,
      entityType,
      entity: originalEntity
    }));
  }
}
