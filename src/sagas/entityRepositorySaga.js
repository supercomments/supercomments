import { call, put } from 'redux-saga/effects';

import * as Actions from 'constants/actions';
import buildAction from 'helpers/buildAction';
import { waitFor } from 'sagas/helpers';

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
    const entity = yield* createEntity();

    const entityWithId = {
      ...entity,
      id: transientId,
      transient: true
    };

    try {
      yield put(buildAction(Actions.CreateEntity, {
        entityType,
        entity: entityWithId
      }));

      const {
        entities,
        result
      } = yield call(apiCallEffect, extractEffectParams(entity));

      yield put(buildAction(Actions.DeleteEntity, {
        entityType,
        id: transientId
      }));

      yield put(buildAction(Actions.CreateEntity, {
        entityType,
        entity: entities[entityType][result]
      }));

      return result;
    } catch (ex) {
      console.warn('An error while trying to optimistically create an entity has occurred', ex);

      yield put(buildAction(Actions.DeleteEntity, {
        entityType,
        id: transientId
      }));

      yield* onRollback(entity);
      yield* waitFor(Actions.Retry, retrySelector);
    }
  }
}
