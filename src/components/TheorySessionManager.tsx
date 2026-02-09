import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Book, Play, Square, Unplug } from 'lucide-react';
import { createDetachedSessionTracker } from '@/lib/tauriApi';
import TheorySessionModal from './TheorySessionModal';
import { useTheorySessions } from '@/hooks/useTheorySessions';

const TheorySessionManager = () => {
  const [isTheorySessionActive, setIsTheorySessionActive] = useState(false);
  const [theoryElapsedTime, setTheoryElapsedTime] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [_sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  
  const { addSession } = useTheorySessions();

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  // Таймер для теоретической сессии
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isTheorySessionActive) {
      interval = setInterval(() => {
        setTheoryElapsedTime(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTheorySessionActive]);

  const handleStartTheorySession = () => {
    setIsTheorySessionActive(true);
    setTheoryElapsedTime(0);
    setSessionStartTime(new Date());
  };

  const handleStopTheorySession = () => {
    setIsTheorySessionActive(false);
    setShowModal(true);
  };

  const handleDetach = async () => {
    try {
      await createDetachedSessionTracker();
    } catch (error) {
      console.error('Failed to create detached window:', error);
    }
  };

  const handleSaveSession = (topic: string, notes: string) => {
    // Сохраняем теоретическую сессию через хук
    addSession(topic, theoryElapsedTime, notes);
    
    // Сброс состояния
    setTheoryElapsedTime(0);
    setSessionStartTime(null);
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <div
          className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm container-common"
        >
          {/* Horizontal container with buttons and timer */}
          <div className="flex items-center justify-center gap-6">
            {/* Two square buttons container */}
            <div className="flex gap-3">
              {/* Book button (theory) */}
              <Button
                size="lg"
                variant="outline"
                className="aspect-square h-14 w-14 p-0"
              >
                <Book className="h-5 w-5" />
              </Button>

              {/* Start/Stop theory session button */}
              <Button
                onClick={isTheorySessionActive ? handleStopTheorySession : handleStartTheorySession}
                size="lg"
                variant={isTheorySessionActive ? "destructive" : "default"}
                className="aspect-square h-14 w-14 p-0"
              >
                {isTheorySessionActive ? (
                  <Square className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>
            </div>

            {/* Timer */}
            <div className="text-4xl font-mono tabular-nums text-primary font-bold">
              {formatTime(theoryElapsedTime)}
            </div>
          </div>
        </div>

        {/* Detach button - positioned to the right of the theory container */}
        <Button
          onClick={handleDetach}
          size="sm"
          variant="outline"
          className="aspect-square h-7 w-7 p-0 flex-shrink-0 duplicate-button"
        >
          <Unplug className="h-3 w-3" />
        </Button>
      </div>

      {/* Modal for completed theory session */}
      <TheorySessionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        sessionDuration={theoryElapsedTime}
        onSave={handleSaveSession}
      />
    </>
  );
};

export default TheorySessionManager;
