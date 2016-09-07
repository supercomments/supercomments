const buildOnceMessageEventLister = (expectedMessage, cb) => {
  const eventListener = event => {
    // event.persist();
    const data = event.data;

    if (typeof data === 'object' && data.type === expectedMessage) {
      cb(data);
      window.removeEventListener('message', eventListener, false);
    }
  };

  return eventListener;
};

export const openWindowAndWaitForMessage = (title, url, { width, height }, messageType) =>
  new Promise(res => {
    window.addEventListener('message', buildOnceMessageEventLister(messageType, res));
    window.open(url, title, `width=${width},height=${height}`);
  });
