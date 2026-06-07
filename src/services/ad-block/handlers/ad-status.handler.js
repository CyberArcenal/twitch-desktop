function getAdStatus(state) {
  return state.getAdPlaying();
}

module.exports = { getAdStatus };