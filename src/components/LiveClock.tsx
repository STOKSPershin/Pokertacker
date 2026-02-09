import { useState, useEffect } from 'react';
import { getCurrentTime } from '@/lib/tauriApi';

const LiveClock = () => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateClock = async () => {
      try {
        // Получаем точное системное время
        const systemTime = await getCurrentTime();
        const now = new Date(systemTime);
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        setTime(`${hours}:${minutes}:${seconds}`);
      } catch (error) {
        // Fallback to browser time if Tauri API fails
        console.warn('Failed to get system time, using browser time:', error);
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        setTime(`${hours}:${minutes}:${seconds}`);
      }
    };

    updateClock(); // Set initial time immediately
    const intervalId = setInterval(updateClock, 1000); // Update every second

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  return (
    <div className="text-center text-2xl font-bold text-primary mb-4">
      {time}
    </div>
  );
};

export default LiveClock;
