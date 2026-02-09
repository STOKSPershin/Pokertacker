import { useState, useRef, useContext, ReactNode, createContext, useEffect, useCallback } from 'react';
import { useStorage } from '@/hooks/useStorage';
import { getCurrentTime } from '@/lib/tauriApi';
import type { Session, SessionPeriod } from '@/types';

type ActiveSession = Omit<Session, 'id' | 'overallEndTime' | 'overallDuration' | 'overallProfit' | 'overallHandsPlayed' | 'notes' | 'handsPlayed'>;

// Define a type for the data stored in localStorage
interface StoredActiveSession {
  id: string; // Client-side generated UUID for persistence
  overallStartTime: string;
  periods: SessionPeriod[];
}

interface SessionContextType {
  activeSession: ActiveSession | null;
  elapsedTime: number;
  currentPeriodType: 'play' | 'break' | 'select';
  startSession: () => Promise<void>;
  stopSession: () => Promise<void>;
  togglePeriod: (newType: 'play' | 'break' | 'select') => Promise<void>;
  completedSession: Omit<Session, 'id' | 'notes' | 'handsPlayed'> | null;
  clearCompletedSession: () => void;
}

export const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider = ({ children }: SessionProviderProps) => {
  useStorage();
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentPeriodType, setCurrentPeriodType] = useState<'play' | 'break' | 'select'>('play');
  const [completedSession, setCompletedSession] = useState<Omit<Session, 'id' | 'notes' | 'handsPlayed'> | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    const storedSessionString = localStorage.getItem('activeSession');
    if (storedSessionString) {
      try {
        const storedSession: StoredActiveSession = JSON.parse(storedSessionString);
        
        setActiveSession({
          overallStartTime: storedSession.overallStartTime,
          periods: storedSession.periods || [],
        });

        const sessionStartTime = new Date(storedSession.overallStartTime).getTime();
        const currentTimestamp = Date.now();
        const calculatedElapsedTime = Math.floor((currentTimestamp - sessionStartTime) / 1000);
        setElapsedTime(calculatedElapsedTime);

        const lastPeriod = storedSession.periods && storedSession.periods.length > 0
          ? storedSession.periods[storedSession.periods.length - 1]
          : null;
        if (lastPeriod) {
          setCurrentPeriodType(lastPeriod.type);
        } else {
          setCurrentPeriodType('play');
        }

        console.log('Active session restored from localStorage.');
      } catch (error) {
        console.error('Failed to parse active session from localStorage:', error);
        localStorage.removeItem('activeSession');
      }
    }

    const storedCompletedSessionString = localStorage.getItem('completedSession');
    if (storedCompletedSessionString) {
      try {
        const storedCompletedSession = JSON.parse(storedCompletedSessionString);
        setCompletedSession(storedCompletedSession);
        console.log('Completed session restored from localStorage.');
      } catch (error) {
        console.error('Failed to parse completed session from localStorage:', error);
        localStorage.removeItem('completedSession');
      }
    }

    return () => stopTimer();
  }, []);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'activeSession') {
        console.log('Storage event detected for activeSession.');
        const newSessionString = event.newValue;
        if (newSessionString) {
          try {
            const newSession: StoredActiveSession = JSON.parse(newSessionString);
            setActiveSession({
              overallStartTime: newSession.overallStartTime,
              periods: newSession.periods || [],
            });
            const lastPeriod = newSession.periods && newSession.periods.length > 0
              ? newSession.periods[newSession.periods.length - 1]
              : null;
            if (lastPeriod) {
              setCurrentPeriodType(lastPeriod.type);
            } else {
              setCurrentPeriodType('play');
            }
          } catch (error) {
            console.error('Failed to parse active session from storage event:', error);
          }
        } else {
          // Session was removed
          setActiveSession(null);
        }
      } else if (event.key === 'completedSession') {
        console.log('Storage event detected for completedSession.');
        const newCompletedSessionString = event.newValue;
        if (newCompletedSessionString) {
          try {
            const newCompletedSession = JSON.parse(newCompletedSessionString);
            setCompletedSession(newCompletedSession);
          } catch (error) {
            console.error('Failed to parse completed session from storage event:', error);
          }
        } else {
          setCompletedSession(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (activeSession) {
      stopTimer();
      intervalRef.current = setInterval(() => {
        const sessionStartTime = new Date(activeSession.overallStartTime).getTime();
        const currentTimestamp = Date.now();
        const calculatedElapsedTime = Math.floor((currentTimestamp - sessionStartTime) / 1000);
        setElapsedTime(calculatedElapsedTime);
      }, 1000);
    }
    return () => stopTimer();
  }, [activeSession, stopTimer]);

  const startSession = async () => {
    try {
      const now = await getCurrentTime();
      const initialPeriods: SessionPeriod[] = [{ type: 'play', startTime: now, endTime: '' }];

      setActiveSession({
        overallStartTime: now,
        periods: initialPeriods,
      });
      setCurrentPeriodType('play');
      setElapsedTime(0);
      setCompletedSession(null);

      const tempId = crypto.randomUUID();
      const sessionToStore: StoredActiveSession = {
        id: tempId,
        overallStartTime: now,
        periods: initialPeriods,
      };
      localStorage.setItem('activeSession', JSON.stringify(sessionToStore));
      console.log('Active session started and saved to localStorage.');
    } catch (error) {
      console.warn('Failed to get system time, using browser time:', error);
      // Fallback to browser time
      const now = new Date().toISOString();
      const initialPeriods: SessionPeriod[] = [{ type: 'play', startTime: now, endTime: '' }];

      setActiveSession({
        overallStartTime: now,
        periods: initialPeriods,
      });
      setCurrentPeriodType('play');
      setElapsedTime(0);
      setCompletedSession(null);

      const tempId = crypto.randomUUID();
      const sessionToStore: StoredActiveSession = {
        id: tempId,
        overallStartTime: now,
        periods: initialPeriods,
      };
      localStorage.setItem('activeSession', JSON.stringify(sessionToStore));
      console.log('Active session started and saved to localStorage.');
    }
  };

  const stopSession = async () => {
    console.log('Шаг 2: Функция stopSession в контексте вызвана');
    if (!activeSession) return;

    try {
      const now = await getCurrentTime();
      const finalizedPeriods = activeSession.periods
        ? activeSession.periods.map((p, index) =>
            index === (activeSession.periods?.length ?? 0) - 1 ? { ...p, endTime: now } : p
          )
        : [];

      const overallStartTimeDate = new Date(activeSession.overallStartTime);
      const overallEndTimeDate = new Date(now);
      const overallDuration = Math.floor((overallEndTimeDate.getTime() - overallStartTimeDate.getTime()) / 1000);

      const sessionData: Omit<Session, 'id' | 'notes' | 'handsPlayed'> = {
        ...activeSession,
        overallEndTime: now,
        overallDuration: overallDuration,
        overallProfit: 0,
        overallHandsPlayed: 0,
        periods: finalizedPeriods,
      };

      setCompletedSession(sessionData);
      localStorage.setItem('completedSession', JSON.stringify(sessionData));
      setActiveSession(null);

      localStorage.removeItem('activeSession');
      console.log('Active session stopped and removed from localStorage.');
    } catch (error) {
      console.warn('Failed to get system time, using browser time:', error);
      // Fallback to browser time
      const now = new Date().toISOString();
      const finalizedPeriods = activeSession.periods
        ? activeSession.periods.map((p, index) =>
            index === (activeSession.periods?.length ?? 0) - 1 ? { ...p, endTime: now } : p
          )
        : [];

      const overallStartTimeDate = new Date(activeSession.overallStartTime);
      const overallEndTimeDate = new Date(now);
      const overallDuration = Math.floor((overallEndTimeDate.getTime() - overallStartTimeDate.getTime()) / 1000);

      const sessionData: Omit<Session, 'id' | 'notes' | 'handsPlayed'> = {
        ...activeSession,
        overallEndTime: now,
        overallDuration: overallDuration,
        overallProfit: 0,
        overallHandsPlayed: 0,
        periods: finalizedPeriods,
      };

      setCompletedSession(sessionData);
      localStorage.setItem('completedSession', JSON.stringify(sessionData));
      setActiveSession(null);

      localStorage.removeItem('activeSession');
      console.log('Active session stopped and removed from localStorage.');
    }
  };

  const togglePeriod = async (newType: 'play' | 'break' | 'select') => {
    if (!activeSession || currentPeriodType === newType) return;

    try {
      const now = await getCurrentTime();
      const updatedPeriods = activeSession.periods
        ? activeSession.periods.map((p, index) =>
            index === (activeSession.periods?.length ?? 0) - 1 ? { ...p, endTime: now } : p
          )
        : [];

      const newPeriod: SessionPeriod = { type: newType, startTime: now, endTime: '' };

      const newActiveSession = {
        ...activeSession,
        periods: [...updatedPeriods, newPeriod],
      };
      setActiveSession(newActiveSession);
      setCurrentPeriodType(newType);

      const storedSessionString = localStorage.getItem('activeSession');
      if (storedSessionString) {
        try {
          const storedSession: StoredActiveSession = JSON.parse(storedSessionString);
          localStorage.setItem('activeSession', JSON.stringify({
            ...storedSession,
            periods: newActiveSession.periods || [],
          }));
        } catch (error) {
          console.error('Failed to update active session periods in localStorage:', error);
        }
      }
    } catch (error) {
      console.warn('Failed to get system time, using browser time:', error);
      // Fallback to browser time
      const now = new Date().toISOString();
      const updatedPeriods = activeSession.periods
        ? activeSession.periods.map((p, index) =>
            index === (activeSession.periods?.length ?? 0) - 1 ? { ...p, endTime: now } : p
          )
        : [];

      const newPeriod: SessionPeriod = { type: newType, startTime: now, endTime: '' };

      const newActiveSession = {
        ...activeSession,
        periods: [...updatedPeriods, newPeriod],
      };
      setActiveSession(newActiveSession);
      setCurrentPeriodType(newType);

      const storedSessionString = localStorage.getItem('activeSession');
      if (storedSessionString) {
        try {
          const storedSession: StoredActiveSession = JSON.parse(storedSessionString);
          localStorage.setItem('activeSession', JSON.stringify({
            ...storedSession,
            periods: newActiveSession.periods || [],
          }));
        } catch (error) {
          console.error('Failed to update active session periods in localStorage:', error);
        }
      }
    }
  };

  const clearCompletedSession = () => {
    setCompletedSession(null);
    localStorage.removeItem('completedSession');
  };

  const contextValue = {
    activeSession,
    elapsedTime,
    currentPeriodType,
    startSession,
    stopSession,
    togglePeriod,
    completedSession,
    clearCompletedSession,
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
