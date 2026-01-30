import func2url from '../../backend/func2url.json';

const PROXY_URL = func2url['yandex-proxy'];

/**
 * Конвертирует публичную ссылку Яндекс.Диска в прокси-ссылку для воспроизведения
 * @param publicUrl - публичная ссылка с Яндекс.Диска
 * @returns прокси-ссылка или исходная ссылка
 */
export async function convertYandexDiskUrl(publicUrl: string): Promise<string> {
  if (!publicUrl.includes('disk.yandex.ru') && !publicUrl.includes('disk.yandex.com')) {
    return publicUrl;
  }

  const proxyUrl = `${PROXY_URL}?url=${encodeURIComponent(publicUrl)}`;
  console.log('✅ [YandexDisk] Использую прокси-сервер для воспроизведения');
  return proxyUrl;
}

/**
 * Проверяет, является ли URL ссылкой на Яндекс.Диск
 */
export function isYandexDiskUrl(url: string): boolean {
  return url.includes('disk.yandex.ru') || url.includes('disk.yandex.com');
}