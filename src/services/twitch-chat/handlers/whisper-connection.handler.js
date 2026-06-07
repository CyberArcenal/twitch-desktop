const { ChatClient } = require('@twurple/chat');
const { getAuthProvider } = require('./auth-provider.handler');
const { handleWhisper } = require('./whisper-receive.handler'); // will create
const { logger } = require('../../../utils/logger');

async function connectToWhispers(state) {
  if (state.getWhisperClient()) return;

  logger.info('[Chat] Connecting whisper service');
  try {
    const authProvider = await getAuthProvider(state);
    const whisperClient = new ChatClient({ authProvider, channels: [] });
    state.setWhisperClient(whisperClient);
    setupWhisperListeners(state);
    await whisperClient.connect();

    whisperClient.onDisconnect(async (manually) => {
      if (!manually) {
        logger.warn('[Chat] Whisper client disconnected, reconnecting...');
        await connectToWhispers(state);
      }
    });

    logger.success('[Chat] Whisper service connected');
  } catch (err) {
    logger.error('[Chat] Whisper init failed:', err);
  }
}

function setupWhisperListeners(state) {
  if (state.isWhisperListenersSetup()) return;
  const whisperClient = state.getWhisperClient();
  if (!whisperClient) {
    logger.warn('[Chat] Whisper client not ready');
    return;
  }
  state.setWhisperListenersSetup(true);

  whisperClient.onWhisper((sender, message, msg) => {
    handleWhisper(state, sender, message, msg);
  });

  logger.info('[Chat] Whisper listeners active');
}

async function disconnectWhispers(state) {
  if (state.getWhisperClient()) {
    await state.getWhisperClient().quit();
    state.setWhisperClient(null);
  }
  state.setWhisperListenersSetup(false);
}

module.exports = { connectToWhispers, disconnectWhispers };