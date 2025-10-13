import { saveAudioToIndexedDB } from './audioStorage';
import { apiClient } from './apiClient';

export const saveAudioFile = async (file: File, filename: string, trackData: { title: string; duration: string }): Promise<string> => {
  try {
    console.log('💾 Начинаем сохранение аудиофайла:', filename);
    
    const fileId = await saveAudioToIndexedDB(file, filename);
    console.log('✅ Файл сохранен в IndexedDB:', fileId);
    
    const reader = new FileReader();
    const audioDataUrl = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Ошибка чтения файла'));
      reader.readAsDataURL(file);
    });
    
    console.log('📤 Отправляем аудиофайл на сервер...');
    await apiClient.saveMediaToServer(fileId, file.type, audioDataUrl);
    console.log('✅ Аудиофайл успешно сохранен на сервер');
    
    const trackInfo = {
      id: Date.now().toString(),
      title: trackData.title,
      duration: trackData.duration,
      file: fileId,
      price: 129
    };

    const savedTracks = localStorage.getItem('uploadedTracks');
    let uploadedTracks = [];
    if (savedTracks) {
      uploadedTracks = JSON.parse(savedTracks);
    }
    uploadedTracks.push(trackInfo);
    localStorage.setItem('uploadedTracks', JSON.stringify(uploadedTracks));

    window.dispatchEvent(new CustomEvent('tracksUpdated'));
    
    return fileId;
  } catch (error) {
    console.error('❌ Ошибка сохранения файла:', error);
    throw new Error(`Ошибка сохранения файла: ${error}`);
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
  
  // Проверяем размер файла (максимум 50МБ)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    return { isValid: false, error: 'Размер файла превышает 50МБ' };
  }
  
  // Проверяем поддерживаемые форматы
  const supportedTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/m4a'];
  if (!supportedTypes.some(type => file.type === type || file.name.toLowerCase().includes(type.split('/')[1]))) {
    return { isValid: false, error: 'Поддерживаемые форматы: MP3, WAV, OGG, AAC, M4A' };
  }
  
  return { isValid: true };
};