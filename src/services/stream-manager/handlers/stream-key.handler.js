function getStreamKey(store) {
  return store.get('streamKey', null);
}

function saveStreamKey(store, key) {
  store.set('streamKey', key);
}

module.exports = { getStreamKey, saveStreamKey };