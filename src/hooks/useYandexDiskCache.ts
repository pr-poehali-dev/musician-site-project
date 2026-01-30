import { useEffect } from 'react';
import { clearUrlCache, getCacheStats } from '@/utils/yandexDisk';

/**
 * Хук для управления кешем Яндекс.Диска
 * Автоматически очищает кеш при размонтировании компонента (опционально)
 */
export function useYandexDiskCache(clearOnUnmount = false) {
  useEffect(() => {
    return () => {
      if (clearOnUnmount) {
        clearUrlCache();
      }
    };
  }, [clearOnUnmount]);

  return {
    clearCache: clearUrlCache,
    getCacheStats,
  };
}
