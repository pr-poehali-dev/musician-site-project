export const saveAudioFile = async (file: File, filename: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onload = function(event) {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const blob = new Blob([arrayBuffer], { type: file.type });
        
        // Создаем ссылку для скачивания файла
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        
        // Имитируем клик для сохранения файла
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Очищаем URL после использования
        URL.revokeObjectURL(url);
        
        // В реальном приложении здесь был бы API вызов для загрузки на сервер
        // const savedPath = await uploadToServer(file, filename);
        
        // Возвращаем путь к сохраненному файлу в папке public/audio
        const savedPath = `/audio/${filename}`;
        resolve(savedPath);
      };
      
      reader.onerror = function() {
        reject(new Error('Ошибка чтения файла'));
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error) {
      reject(error);
    }
  });
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