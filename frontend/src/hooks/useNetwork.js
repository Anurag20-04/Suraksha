import { useState, useEffect } from 'react';

export const useNetwork = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSlowNetwork, setIsSlowNetwork] = useState(false);

  useEffect(() => {
    const handleOnline  = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check network speed via connection API
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
      const checkSpeed = () => {
        const slow = ['slow-2g', '2g', '3g'].includes(conn.effectiveType) || conn.downlink < 1;
        setIsSlowNetwork(slow);
      };
      checkSpeed();
      conn.addEventListener('change', checkSpeed);
      return () => {
        window.removeEventListener('online',  handleOnline);
        window.removeEventListener('offline', handleOffline);
        conn.removeEventListener('change', checkSpeed);
      };
    }

    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, isSlowNetwork, isSlow: isSlowNetwork || !isOnline };
};
