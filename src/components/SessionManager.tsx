import { useStorage } from '@/hooks/useStorage';
import { useSession } from '@/context/SessionContext';
import { Button } from './ui/button';
import { Play, Square, Search, Spade, Unplug } from 'lucide-react';
import { createDetachedSessionTracker } from '@/lib/tauriApi';

interface SessionManagerProps {
  // No props needed as SessionContext handles completion
}

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};

const SessionManager = ({}: SessionManagerProps) => {
  const { settings: _settings } = useStorage();
  const {
    activeSession,
    elapsedTime,
    currentPeriodType,
    startSession,
    stopSession,
    togglePeriod,
  } = useSession();

  const handleStart = async () => {
    await startSession();
  };

  const handleStop = async () => {
    console.log('Шаг 1: Кнопка "Остановить" нажата');
    await stopSession();
  };

  const handleTogglePeriod = async (newType: 'play' | 'select') => {
    await togglePeriod(newType);
  };

  const handleDetach = async () => {
    try {
      await createDetachedSessionTracker();
    } catch (error) {
      console.error('Failed to create detached window:', error);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm container-common">
        {/* Horizontal container with buttons and timer */}
        <div className="flex items-center justify-center gap-6">
          {/* Three square buttons container */}
          <div className="flex gap-3">
            {/* Select mode button (magnifying glass) */}
            <Button
              onClick={() => activeSession && handleTogglePeriod('select')}
              disabled={!activeSession}
              size="lg"
              variant="outline"
              className={`
                aspect-square h-14 w-14 p-0
                ${activeSession && currentPeriodType === 'select' 
                  ? 'border-red-300 border' 
                  : activeSession 
                    ? 'opacity-50' 
                    : 'opacity-50'
                }
              `}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Play mode button (playing cards) */}
            <Button
              onClick={() => activeSession && handleTogglePeriod('play')}
              disabled={!activeSession}
              size="lg"
              variant="outline"
              className={`
                aspect-square h-14 w-14 p-0
                ${activeSession && currentPeriodType === 'play' 
                  ? 'border-red-300 border' 
                  : activeSession 
                    ? 'opacity-50' 
                    : 'opacity-50'
                }
              `}
            >
              <Spade className="h-5 w-5" />
            </Button>

            {/* Start/Stop session button */}
            <Button
              onClick={activeSession ? handleStop : handleStart}
              size="lg"
              variant={activeSession ? "destructive" : "default"}
              className="aspect-square h-14 w-14 p-0"
            >
              {activeSession ? (
                <Square className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Timer */}
          <div className="text-4xl font-mono tabular-nums text-primary font-bold">
            {formatTime(elapsedTime)}
          </div>
        </div>
      </div>
      
      {/* Detach button - positioned to the right of the main container */}
      <Button
        onClick={handleDetach}
        size="sm"
        variant="outline"
        className="aspect-square h-7 w-7 p-0 flex-shrink-0 duplicate-button"
      >
        <Unplug className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default SessionManager;
