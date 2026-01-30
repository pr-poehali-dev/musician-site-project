const urlCache = new Map<string, { url: string; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000;

/**
 * Конвертирует публичную ссылку Яндекс.Диска в прямую ссылку для воспроизведения
 * @param publicUrl - публичная ссылка с Яндекс.Диска
 * @returns прямая ссылка на файл или исходная ссылка при ошибке
 */
export async function convertYandexDiskUrl(publicUrl: string): Promise<string> {
  if (!publicUrl.includes('disk.yandex.ru') && !publicUrl.includes('disk.yandex.com')) {
    return publicUrl;
  }

  const cached = urlCache.get(publicUrl);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('✅ [YandexDisk] Использую кешированную ссылку');
    return cached.url;
  }

  try {
    const apiUrl = `https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key=${encodeURIComponent(publicUrl)}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      console.warn('⚠️ [YandexDisk] API вернул ошибку, пробую альтернативный метод');
      return getAlternativeUrl(publicUrl);
    }
    
    const data = await response.json();
    
    if (data.href) {
      console.log('✅ [YandexDisk] Получена прямая ссылка через API');
      urlCache.set(publicUrl, { url: data.href, timestamp: Date.now() });
      return data.href;
    }
    
    return getAlternativeUrl(publicUrl);
  } catch (error) {
    console.error('❌ [YandexDisk] Ошибка API:', error);
    return getAlternativeUrl(publicUrl);
  }
}

function getAlternativeUrl(publicUrl: string): string {
  try {
    const url = new URL(publicUrl);
    
    if (url.pathname.startsWith('/d/')) {
      const hash = url.pathname.split('/d/')[1];
      const directUrl = `https://downloader.disk.yandex.ru/disk/${hash}/${encodeURIComponent(url.searchParams.get('name') || 'file')}`;
      console.log('✅ [YandexDisk] Использую прямую ссылку через downloader');
      urlCache.set(publicUrl, { url: directUrl, timestamp: Date.now() });
      return directUrl;
    }
    
    console.warn('⚠️ [YandexDisk] Не удалось преобразовать ссылку, использую оригинальную');
    return publicUrl;
  } catch (error) {
    console.error('❌ [YandexDisk] Ошибка парсинга URL:', error);
    return publicUrl;
  }
}

/**
 * Проверяет, является ли URL ссылкой на Яндекс.Диск
 */
export function isYandexDiskUrl(url: string): boolean {
  return url.includes('disk.yandex.ru') || url.includes('disk.yandex.com');
}