// src/renderer/pages/stream-manager/hooks/useQuickActions.ts
import { useCallback } from 'react';
import { streamManagerAPI } from '../../../api/core/streamManager';
import { useShoutout } from '../hooks/useShoutout';
import { dialogs } from '../../../utils/dialogs';


export const useQuickActions = (isLive: boolean) => {
  const { sendShoutout } = useShoutout();

  const runAds = useCallback(async () => {
    if (!isLive) {
      dialogs.error('You must be live to run ads');
      return;
    }
    const length = prompt('Ad length in seconds (30, 60, 90, 120, 150, 180)', '30');
    if (!length) return;
    try {
      await streamManagerAPI.runCommercial(parseInt(length));
      dialogs.alert({message:`Running ${length}s commercial...`});
    } catch (err) {
      dialogs.error('Failed to run ads');
    }
  }, [isLive]);

  const openGoals = useCallback(() => {
    dialogs.alert({message:'Goal management coming soon'});
  }, []);

  const raidShortcut = useCallback(() => {
    const target = prompt('Enter channel name to raid:');
    if (target) {
      dialogs.alert({message:`Raid shortcut: /raid ${target}`});
    }
  }, []);

  const handleShoutout = useCallback(async () => {
    const target = prompt('Enter channel name to shoutout:');
    if (!target) return;
    try {
      await sendShoutout(target);
      dialogs.alert({message:`Shoutout sent to ${target}!`});
    } catch (err: any) {
      dialogs.error(err.message);
    }
  }, [sendShoutout]);

  return {
    runAds,
    openGoals,
    raidShortcut,
    shoutout: handleShoutout,
  };
};