const DB_NAME = 'VintageAlbumsDB';
const ALBUMS_STORE = 'albums';
const COVERS_STORE = 'covers';
const DB_VERSION = 1;

interface StoredAlbum {
  id: string;
  data: any;
  timestamp: number;
}

interface StoredCover {
  id: string;
  blob: Blob;
  timestamp: number;
}

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains(ALBUMS_STORE)) {
        db.createObjectStore(ALBUMS_STORE, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(COVERS_STORE)) {
        db.createObjectStore(COVERS_STORE, { keyPath: 'id' });
      }
    };
  });
};

export const saveAlbumsToIndexedDB = async (albums: any[]): Promise<void> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([ALBUMS_STORE], 'readwrite');
    const store = transaction.objectStore(ALBUMS_STORE);

    const storedData: StoredAlbum = {
      id: 'albums',
      data: albums,
      timestamp: Date.now()
    };

    const request = store.put(storedData);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getAlbumsFromIndexedDB = async (): Promise<any[]> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([ALBUMS_STORE], 'readonly');
    const store = transaction.objectStore(ALBUMS_STORE);
    const request = store.get('albums');

    request.onsuccess = () => {
      const result = request.result as StoredAlbum;
      if (result && result.data) {
        resolve(result.data);
      } else {
        resolve([]);
      }
    };

    request.onerror = () => reject(request.error);
  });
};

export const saveCoverToIndexedDB = async (coverId: string, imageBlob: Blob): Promise<string> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([COVERS_STORE], 'readwrite');
    const store = transaction.objectStore(COVERS_STORE);

    const storedCover: StoredCover = {
      id: coverId,
      blob: imageBlob,
      timestamp: Date.now()
    };

    const request = store.put(storedCover);

    request.onsuccess = () => {
      resolve(`cover_${coverId}`);
    };

    request.onerror = () => reject(request.error);
  });
};

export const getCoverFromIndexedDB = async (coverId: string): Promise<string | null> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([COVERS_STORE], 'readonly');
    const store = transaction.objectStore(COVERS_STORE);
    const request = store.get(coverId);

    request.onsuccess = () => {
      const result = request.result as StoredCover;
      if (result && result.blob) {
        const url = URL.createObjectURL(result.blob);
        resolve(url);
      } else {
        resolve(null);
      }
    };

    request.onerror = () => reject(request.error);
  });
};

export const base64ToBlob = (base64: string): Blob => {
  const parts = base64.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
};

export const migrateAlbumsToIndexedDB = async (): Promise<void> => {
  try {
    const localStorageAlbums = localStorage.getItem('albums');
    if (!localStorageAlbums) return;
    
    const albums = JSON.parse(localStorageAlbums);
    
    for (const album of albums) {
      if (album.cover && album.cover.startsWith('data:image')) {
        const coverId = `album_${album.id}`;
        const blob = base64ToBlob(album.cover);
        await saveCoverToIndexedDB(coverId, blob);
        album.cover = `cover_album_${album.id}`;
      }
    }
    
    await saveAlbumsToIndexedDB(albums);
    
    localStorage.removeItem('albums');
    
    console.log('✅ Альбомы успешно мигрированы в IndexedDB');
  } catch (error) {
    console.error('❌ Ошибка миграции альбомов:', error);
  }
};

export const clearAlbumStorage = async (): Promise<void> => {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([ALBUMS_STORE, COVERS_STORE], 'readwrite');
    
    transaction.objectStore(ALBUMS_STORE).clear();
    transaction.objectStore(COVERS_STORE).clear();
    
    transaction.oncomplete = () => {
      localStorage.removeItem('albums');
      resolve();
    };
    
    transaction.onerror = () => reject(transaction.error);
  });
};
