import { useState, useEffect } from 'react';

export interface TheorySession {
  id: string;
  topic: string;
  duration: number;
  notes: string;
  startTime: Date;
  endTime: Date;
}

export const useTheorySessions = () => {
  const [sessions, setSessions] = useState<TheorySession[]>([]);

  // Загрузка сессий из localStorage при инициализации
  useEffect(() => {
    const savedSessions = localStorage.getItem('theorySessions');
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        // Преобразуем строки дат обратно в объекты Date
        const sessionsWithDates = parsed.map((session: any) => ({
          ...session,
          startTime: new Date(session.startTime),
          endTime: new Date(session.endTime)
        }));
        setSessions(sessionsWithDates);
      } catch (error) {
        console.error('Ошибка при загрузке теоретических сессий:', error);
      }
    }
  }, []);

  // Сохранение сессий в localStorage
  const saveSessions = (newSessions: TheorySession[]) => {
    setSessions(newSessions);
    localStorage.setItem('theorySessions', JSON.stringify(newSessions));
  };

  // Добавление новой сессии
  const addSession = (topic: string, duration: number, notes: string) => {
    const newSession: TheorySession = {
      id: Date.now().toString(),
      topic,
      duration,
      notes,
      startTime: new Date(Date.now() - duration * 1000),
      endTime: new Date()
    };
    
    const updatedSessions = [...sessions, newSession];
    saveSessions(updatedSessions);
  };

  // Получение времени теории за сегодня
  const getTodayTheoryTime = () => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    return sessions
      .filter(session => session.endTime >= startOfDay)
      .reduce((total, session) => total + session.duration, 0);
  };

  // Получение плана по теории (можно настроить по необходимости)
  const getTodayTheoryPlan = () => {
    // По умолчанию план 30 минут в день
    return 30 * 60; // в секундах
  };

  return {
    sessions,
    addSession,
    getTodayTheoryTime,
    getTodayTheoryPlan
  };
};
