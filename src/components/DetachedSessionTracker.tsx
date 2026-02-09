import { useStorage } from '@/hooks/useStorage';
import { useSession } from '@/context/SessionContext';
import { Button } from './ui/button';
import { Play, Square, Search, Spade } from 'lucide-react';
import { focusMainWindow } from '@/lib/tauriApi';

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};

const DetachedSessionTracker = () => {
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
    await focusMainWindow();
    await stopSession();
  };

  const handleTogglePeriod = async (newType: 'play' | 'select') => {
    await togglePeriod(newType);
  };

  // Manual sizing configuration for small window (150x130)
  const isSmallWindow = window.innerWidth <= 290; // Detect small window
  
  const containerStyles = isSmallWindow ? {
    width: '210px',
    height: '50px',
    padding: '3px'
  } : {
    width: '408px',
    height: '90px', 
    padding: '8px'
  };

  const buttonSize = isSmallWindow ? 31 : 70; // 14px for small, 70px for large
  const iconSize = Math.floor(buttonSize * 0.75); // 3/4 of button size
  const timerFontSize = Math.floor(buttonSize * 0.70); // 80% of button height
  const gap = isSmallWindow ? 4 : 12; // Spacing between elements

  return (
    <div 
      className="rounded-lg border bg-card text-card-foreground shadow-sm flex items-center justify-center"
      style={containerStyles}
    >
      <div className="flex items-center justify-center" style={{ gap: `${gap}px` }}>
        <div className="flex" style={{ gap: `${gap}px` }}>
          {/* Select mode button (magnifying glass) */}
          <Button
            onClick={() => activeSession && handleTogglePeriod('select')}
            disabled={!activeSession}
            size="lg"
            variant="outline"
            className={`
              p-0 border
              ${activeSession && currentPeriodType === 'select' 
                ? 'border-red-300' 
                : activeSession 
                  ? 'opacity-50' 
                  : 'opacity-50'
              }
            `}
            style={{
              width: `${buttonSize}px`,
              height: `${buttonSize}px`,
              aspectRatio: '1'
            }}
          >
            <Search style={{ width: `${iconSize}px`, height: `${iconSize}px` }} className="stroke-2" />
          </Button>

          {/* Play mode button (playing cards) */}
          <Button
            onClick={() => activeSession && handleTogglePeriod('play')}
            disabled={!activeSession}
            size="lg"
            variant="outline"
            className={`
              p-0 border
              ${activeSession && currentPeriodType === 'play' 
                ? 'border-red-300' 
                : activeSession 
                  ? 'opacity-50' 
                  : 'opacity-50'
              }
            `}
            style={{
              width: `${buttonSize}px`,
              height: `${buttonSize}px`,
              aspectRatio: '1'
            }}
          >
            <Spade style={{ width: `${iconSize}px`, height: `${iconSize}px` }} className="stroke-2" />
          </Button>

          {/* Start/Stop session button */}
          <Button
            onClick={activeSession ? handleStop : handleStart}
            size="lg"
            variant={activeSession ? "destructive" : "default"}
            className="p-0 border"
            style={{
              width: `${buttonSize}px`,
              height: `${buttonSize}px`,
              aspectRatio: '1'
            }}
          >
            {activeSession ? (
              <Square style={{ width: `${iconSize}px`, height: `${iconSize}px` }} className="stroke-2" />
            ) : (
              <Play style={{ width: `${iconSize}px`, height: `${iconSize}px` }} className="stroke-2" />
            )}
          </Button>
        </div>

        <div 
          className="font-mono tabular-nums text-primary font-bold cursor-move select-none"
          data-tauri-drag-region
          style={{
            fontSize: `${timerFontSize}px`,
            lineHeight: '1'
          }}
        >
          {formatTime(elapsedTime)}
        </div>
      </div>
    </div>
  );
};

export default DetachedSessionTracker;