import { useEffect, useRef, useState } from 'react';

interface UseRealtimeSyncOptions {
  onSync: () => Promise<void>;
  pollingInterval?: number;
  enableVisibilityDetection?: boolean;
}

/**
 * Хук для синхронизации данных в реальном времени
 * - Автоматическое обновление по интервалу
 - Синхронизация при возвращении на страницу
 * - Синхронизация при восстановлении соединения
 * - Адаптивный интервал (меньше при активности)
 */
export const useRealtimeSync = ({
  onSync,
  pollingInterval = 5000,
  enableVisibilityDetection = true
}: UseRealtimeSyncOptions) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentInterval = useRef(pollingInterval);

  // Выполнить синхронизацию
  const performSync = async () => {
    if (!isOnline) {
      console.log('⚠️ Офлайн режим - синхронизация пропущена');
      return;
    }

    try {
      await onSync();
      setLastSyncTime(new Date());
      console.log('✅ Синхронизация выполнена:', new Date().toLocaleTimeString());
    } catch (error) {
      console.error('❌ Ошибка синхронизации:', error);
    }
  };

  // Адаптивный интервал: ускоряем при активности пользователя
  const resetInterval = (newInterval: number = pollingInterval) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    currentInterval.current = newInterval;
    intervalRef.current = setInterval(performSync, newInterval);
  };

  useEffect(() => {
    // Первая синхронизация
    performSync();

    // Запуск регулярной синхронизации
    resetInterval();

    // Отслеживание онлайн/офлайн статуса
    const handleOnline = () => {
      console.log('🌐 Соединение восстановлено');
      setIsOnline(true);
      performSync(); // Синхронизируем сразу при восстановлении
    };

    const handleOffline = () => {
      console.log('📡 Соединение потеряно');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Отслеживание видимости страницы
    if (enableVisibilityDetection) {
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          console.log('👀 Страница снова активна');
          performSync(); // Синхронизируем при возврате на страницу
          resetInterval(2000); // Ускоряем обновления на 2 сек
          
          // Возвращаем нормальный интервал через 10 секунд
          setTimeout(() => {
            resetInterval(pollingInterval);
          }, 10000);
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    lastSyncTime,
    manualSync: performSync
  };
};
