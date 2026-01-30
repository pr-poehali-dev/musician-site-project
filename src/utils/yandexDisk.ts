/**
 * Конвертирует публичную ссылку Яндекс.Диска в прямую ссылку для воспроизведения
 * @param publicUrl - публичная ссылка с Яндекс.Диска
 * @returns прямая ссылка на файл или исходная ссылка при ошибке
 */
export async function convertYandexDiskUrl(publicUrl: string): Promise<string> {
  // Если это не ссылка Яндекс.Диска, возвращаем как есть
  if (!publicUrl.includes('disk.yandex.ru') && !publicUrl.includes('disk.yandex.com')) {
    return publicUrl;
  }

  try {
    // API Яндекс.Диска для получения прямой ссылки на скачивание
    const apiUrl = `https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key=${encodeURIComponent(publicUrl)}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      console.warn('⚠️ [YandexDisk] Не удалось получить прямую ссылку, используем публичную');
      return publicUrl;
    }
    
    const data = await response.json();
    
    if (data.href) {
      console.log('✅ [YandexDisk] Получена прямая ссылка для воспроизведения');
      return data.href;
    }
    
    return publicUrl;
  } catch (error) {
    console.error('❌ [YandexDisk] Ошибка конвертации ссылки:', error);
    return publicUrl;
  }
}

/**
 * Проверяет, является ли URL ссылкой на Яндекс.Диск
 */
export function isYandexDiskUrl(url: string): boolean {
  return url.includes('disk.yandex.ru') || url.includes('disk.yandex.com');
}
