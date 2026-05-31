import { useState, useEffect } from 'react';
import { streamManagerAPI } from '../../../api/core/streamManager';

export const useOBSConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [softwareName, setSoftwareName] = useState('');

  useEffect(() => {
    const checkOBS = async () => {
      const res = await streamManagerAPI.isOBSRunning();
      if (res.status && res.data) {
        setIsConnected(true);
        setSoftwareName('OBS Studio');
      } else {
        setIsConnected(false);
        setSoftwareName('');
      }
    };
    checkOBS();
    const interval = setInterval(checkOBS, 5000);
    return () => clearInterval(interval);
  }, []);

  return { isConnected, softwareName };
};