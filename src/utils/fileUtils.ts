import { saveAudioToIndexedDB } from './audioStorage';

export const saveAudioFile = async (file: File, filename: string, trackData: { title: string; duration: string }): Promise<string> => {
  try {
    const base64Data = await saveAudioToIndexedDB(file, filename);
    return base64Data;
  } catch (error) {
    throw new Error(`Ошибка конвертации файла: ${error}`);
  }
};

export const generateAudioFilename = (originalName: string, trackTitle: string): string => {
  // Очищаем название трека от специальных символов
  const cleanTitle = trackTitle
    .toLowerCase()
    .replace(/[^a-zа-яё0-9\s]/gi, '')
    .replace(/\s+/g, '_')
    .trim();
  
  // Получаем расширение файла
  const extension = originalName.split('.').pop() || 'mp3';
  
  // Добавляем временную метку для уникальности
  const timestamp = Date.now();
  
  return `${cleanTitle}_${timestamp}.${extension}`;
};

export const createAudioDirectory = () => {
  // В реальном приложении здесь был бы запрос к серверу для создания директории
  // В браузерной версии эта функция служит для документирования структуры
  console.log('Создание директории /public/audio/ для сохранения аудиофайлов');
};

export const validateAudioFile = (file: File): { isValid: boolean; error?: string } => {
  // Проверяем тип файла
  if (!file.type.startsWith('audio/')) {
    return { isValid: false, error: 'Выбранный файл не является аудиофайлом' };
  }
  
  // Проверяем размер файла (максимум 2МБ для base64 загрузки)
  // base64 увеличивает размер на ~33%, поэтому 2MB файл = ~2.7MB base64
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    return { isValid: false, error: 'Размер файла превышает 2МБ. Пожалуйста, сожмите файл или уменьшите качество аудио.' };
  }
  
  // Проверяем поддерживаемые форматы
  const supportedTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/m4a'];
  if (!supportedTypes.some(type => file.type === type || file.name.toLowerCase().includes(type.split('/')[1]))) {
    return { isValid: false, error: 'Поддерживаемые форматы: MP3, WAV, OGG, AAC, M4A' };
  }
  
  return { isValid: true };
};