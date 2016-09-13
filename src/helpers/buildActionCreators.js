export default actions => Object
  .keys(actions)
  .reduce((memo, action) => ({
    ...memo,
    [action]: payload => ({
      type: actions[action],
      payload: typeof payload === 'object' && payload.persist ? null : payload
    })
  }), {});
