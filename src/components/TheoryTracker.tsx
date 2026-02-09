import { useTheorySessions } from '@/hooks/useTheorySessions';

const TheoryTracker = () => {
  const { getTodayTheoryTime, getTodayTheoryPlan } = useTheorySessions();

  const theoryTimeToday = getTodayTheoryTime();
  const dailyTheoryPlan = getTodayTheoryPlan();

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return '0 мин';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) {
      return `${h} ч ${m} мин`;
    }
    return `${m} мин`;
  };

  return (
    <div
      className="p-3 rounded-lg border bg-card text-card-foreground shadow-sm text-center container-common"
    >
      <h3 className="text-2xl font-semibold mb-2">Трекер теории</h3>
      <p className="text-lg">
        Теория сегодня: <b>{formatDuration(theoryTimeToday)}</b> / План: <b>{formatDuration(dailyTheoryPlan)}</b>
      </p>
    </div>
  );
};

export default TheoryTracker;
