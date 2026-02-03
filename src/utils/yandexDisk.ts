import func2url from '../../backend/func2url.json';

const PROXY_URL = func2url['yandex-proxy'];

interface CachedUrl {
  proxyUrl: string;
  timestamp: number;
}

const urlCache = new Map<string, CachedUrl>();
const CACHE_DURATION = 30 * 60 * 1000;

/**
 * Очищает устаревшие записи из кеша
 */
function cleanExpiredCache(): void {
  const now = Date.now();
  const expiredKeys: string[] = [];
  
  urlCache.forEach((value, key) => {
    if (now - value.timestamp > CACHE_DURATION) {
      expiredKeys.push(key);
    }
  });
  
  expiredKeys.forEach(key => urlCache.delete(key));
  
  if (expiredKeys.length > 0) {
    console.log(`🧹 [YandexDisk] Очищено ${expiredKeys.length} устаревших записей из кеша`);
  }
}

/**
 * Конвертирует публичную ссылку Яндекс.Диска в прокси-ссылку для воспроизведения
 * @param publicUrl - публичная ссылка с Яндекс.Диска
 * @returns прокси-ссылка или исходная ссылка
 */
export async function convertYandexDiskUrl(publicUrl: string): Promise<string> {
  if (!publicUrl.includes('disk.yandex.ru') && !publicUrl.includes('disk.yandex.com')) {
    return publicUrl;
  }

  const cached = urlCache.get(publicUrl);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    console.log('✅ [YandexDisk] Использую кешированную прямую ссылку');
    return cached.proxyUrl;
  }

  try {
    const response = await fetch(`${PROXY_URL}?url=${encodeURIComponent(publicUrl)}`);
    
    if (!response.ok) {
      throw new Error(`Proxy error: ${response.status}`);
    }
    
    const data = await response.json();
    const directUrl = data.url;
    
    urlCache.set(publicUrl, {
      proxyUrl: directUrl,
      timestamp: now
    });
    
    console.log('✅ [YandexDisk] Получена прямая ссылка на файл (кеш: 30 мин)');
    
    if (urlCache.size > 50) {
      cleanExpiredCache();
    }
    
    return directUrl;
  } catch (error) {
    console.error('❌ [YandexDisk] Ошибка получения прямой ссылки:', error);
    return publicUrl;
  }
}

/**
 * Очищает весь кеш URL
 */
export function clearUrlCache(): void {
  const size = urlCache.size;
  urlCache.clear();
  console.log(`🗑️ [YandexDisk] Кеш очищен (удалено ${size} записей)`);
}

/**
 * Получает статистику кеша
 */
export function getCacheStats(): { size: number; duration: number } {
  return {
    size: urlCache.size,
    duration: CACHE_DURATION
  };
}

/**
 * Проверяет, является ли URL ссылкой на Яндекс.Диск
 */
export function isYandexDiskUrl(url: string): boolean {
  return url.includes('disk.yandex.ru') || url.includes('disk.yandex.com');
}