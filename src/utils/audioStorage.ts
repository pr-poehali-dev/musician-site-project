// IndexedDB для хранения аудиофайлов
const DB_NAME = 'VintageAudioDB';
const STORE_NAME = 'audioFiles';
const DB_VERSION = 1;

interface AudioFile {
  id: string;
  filename: string;
  blob: Blob;
  uploadedAt: number;
}

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const saveAudioToIndexedDB = async (file: File, filename: string): Promise<string> => {
  const db = await openDB();
  const fileId = `audio_${Date.now()}_${filename}`;

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const audioFile: AudioFile = {
      id: fileId,
      filename,
      blob: file,
      uploadedAt: Date.now()
    };

    const request = store.add(audioFile);

    request.onsuccess = () => {
      resolve(fileId);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const getAudioFromIndexedDB = async (fileId: string): Promise<string> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(fileId);

    request.onsuccess = () => {
      const result = request.result as AudioFile;
      if (result && result.blob) {
        const url = URL.createObjectURL(result.blob);
        resolve(url);
      } else {
        console.error('❌ Аудиофайл не найден в IndexedDB:', fileId);
        reject(new Error(`Аудиофайл ${fileId} не найден в базе данных`));
      }
    };

    request.onerror = () => {
      console.error('❌ Ошибка чтения из IndexedDB:', request.error);
      reject(request.error);
    };
  });
};

export const deleteAudioFromIndexedDB = async (fileId: string): Promise<void> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(fileId);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getAllAudioFiles = async (): Promise<AudioFile[]> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};