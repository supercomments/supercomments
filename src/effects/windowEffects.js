import { merge } from 'lodash';

const LOCAL_STORAGE_KEY = 'supercomments';

const buildOnceMessageEventLister = (expectedMessage, cb) => {
  const eventListener = event => {
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

export const saveToLocalStorage = input => {
  const data = window.localStorage[LOCAL_STORAGE_KEY] ?
    JSON.parse(window.localStorage[LOCAL_STORAGE_KEY]) :
    {};

  const mergedData = merge(data, input);

  window.localStorage[LOCAL_STORAGE_KEY] = JSON.stringify(mergedData);
};

export const restoreFromLocalStorage = () => {
  if (window.localStorage[LOCAL_STORAGE_KEY]) {
    return JSON.parse(window.localStorage[LOCAL_STORAGE_KEY]);
  } else {
    return null;
  }
};
