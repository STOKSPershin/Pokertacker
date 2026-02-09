import { useEffect, useMemo } from 'react';
import { format, startOfDay } from 'date-fns';
import SessionManager from '@/components/SessionManager';
import PostSessionModal from '@/components/PostSessionModal';
import LiveClock from '@/components/LiveClock';
import TodayStats from '@/components/TodayStats';
import TheoryTracker from '@/components/TheoryTracker';
import TheorySessionManager from '@/components/TheorySessionManager';
import { useStorage } from '@/hooks/useStorage';
import { useSession } from '@/context/SessionContext';

const SessionPage = () => {
  const { settings, sessions } = useStorage();
  const { completedSession, clearCompletedSession } = useSession();

  const today = useMemo(() => startOfDay(new Date()), []);
  const todayString = useMemo(() => format(today, 'yyyy-MM-dd'), [today]);

  const totalHandsToday = useMemo(() => {
    return sessions
      .filter(session => {
        const sessionDateLocalString = format(new Date(session.overallStartTime), 'yyyy-MM-dd');
        return sessionDateLocalString === todayString;
      })
      .reduce((sum, session) => sum + (session.handsPlayed || 0), 0);
  }, [sessions, todayString]);

  useEffect(() => {
    if (completedSession) {
      // Modal will open automatically because completedSession is not null
    }
  }, [completedSession]);

  const handleCloseModal = () => {
    clearCompletedSession();
  };

  return (
    <>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center" style={{ gap: 'var(--container-spacing)' }}>
          {settings.showLiveClock && <LiveClock />}
          {settings.showTodayStats && <div className="session-tracker"><TodayStats /></div>}
          <div className="session-manager"><SessionManager /></div>
          <div className="theory-tracker"><TheoryTracker /></div>
          <div className="theory-session-manager"><TheorySessionManager /></div>
        </div>
      </div>
      <PostSessionModal
        isOpen={!!completedSession}
        onClose={handleCloseModal}
        session={completedSession}
        totalHandsToday={totalHandsToday}
      />
    </>
  );
};

export default SessionPage;
