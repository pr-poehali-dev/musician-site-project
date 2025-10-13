import { Album, Track } from '@/types';

const API_URL = 'https://functions.poehali.dev/25aac639-cf81-4eb7-80fc-aa9a157a25e6';

export const apiClient = {
  async saveTrackToServer(track: Track): Promise<void> {
    const requestData = {
      id: track.id,
      album_id: track.albumId || '',
      title: track.title,
      duration: track.duration,
      file: track.file,
      price: track.price,
      cover: track.cover || '',
      track_order: 0
    };
    
    console.log('📤 [saveTrackToServer] Начинаем сохранение трека');
    console.log('📤 [saveTrackToServer] URL:', `${API_URL}?path=track`);
    console.log('📤 [saveTrackToServer] Данные:', requestData);
    
    try {
      const response = await fetch(`${API_URL}?path=track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });
      
      console.log('📥 [saveTrackToServer] Получен ответ, статус:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [saveTrackToServer] Ошибка сервера:', response.status, errorText);
        throw new Error(`Ошибка сохранения трека: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('✅ [saveTrackToServer] Трек сохранен успешно:', result);
    } catch (error) {
      console.error('❌ [saveTrackToServer] Исключение при сохранении:', error);
      throw error;
    }
  },

  async saveAlbumToServer(album: Album): Promise<void> {
    const response = await fetch(`${API_URL}?path=album`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: album.id,
        title: album.title,
        artist: album.artist,
        cover: album.cover,
        price: album.price,
        description: album.description || ''
      })
    });
    
    if (!response.ok) {
      throw new Error('Ошибка сохранения альбома на сервере');
    }
    
    console.log('✅ Альбом сохранен в базу данных:', album.title);
  },

  async deleteAlbumFromServer(albumId: string): Promise<void> {
    const response = await fetch(`${API_URL}?path=album&id=${albumId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Ошибка удаления альбома с сервера');
    }
    
    console.log('✅ Альбом удален из базы данных:', albumId);
  },

  async updateAlbumOnServer(albumId: string, albumData: Omit<Album, 'id'>): Promise<void> {
    const response = await fetch(`${API_URL}?path=album`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: albumId,
        title: albumData.title,
        artist: albumData.artist,
        cover: albumData.cover,
        price: albumData.price,
        description: albumData.description || ''
      })
    });
    
    if (!response.ok) {
      throw new Error('Ошибка обновления альбома на сервере');
    }
    
    console.log('✅ Альбом обновлен в базе данных:', albumId);
  },

  async loadAlbumsFromServer(): Promise<Album[]> {
    try {
      const response = await fetch(`${API_URL}?path=albums`);
      if (!response.ok) return [];
      
      const albums = await response.json();
      const localAlbums = JSON.parse(localStorage.getItem('albums') || '[]');
      
      const processedAlbums = await Promise.all(albums.map(async (album: any) => {
        const localAlbum = localAlbums.find((a: any) => a.id === album.id);
        
        let coverUrl = album.cover || localAlbum?.cover || '';
        if (coverUrl && coverUrl.startsWith('cover_')) {
          const mediaData = await this.getMediaFile(coverUrl);
          if (mediaData) coverUrl = mediaData;
        }
        
        const processedTracks = await Promise.all((album.trackList || []).map(async (track: any) => {
          const localTrack = localAlbum?.trackList?.find((t: any) => t.id === track.id);
          
          let fileUrl = track.file || localTrack?.file || '';
          if (fileUrl && fileUrl.startsWith('audio_') && fileUrl.length < 50) {
            const mediaData = await this.getMediaFile(fileUrl);
            if (mediaData) fileUrl = mediaData;
          }
          
          let trackCover = track.cover || localTrack?.cover || coverUrl;
          if (trackCover && trackCover.startsWith('cover_')) {
            const mediaData = await this.getMediaFile(trackCover);
            if (mediaData) trackCover = mediaData;
          }
          
          return {
            id: track.id,
            title: track.title,
            duration: track.duration,
            file: fileUrl,
            price: track.price,
            cover: trackCover,
            albumId: album.id
          };
        }));
        
        return {
          id: album.id,
          title: album.title,
          artist: album.artist,
          tracks: album.tracks_count || 0,
          price: album.price,
          cover: coverUrl,
          description: album.description,
          trackList: processedTracks
        };
      }));
      
      return processedAlbums;
    } catch (error) {
      console.error('Ошибка загрузки альбомов:', error);
      return [];
    }
  },

  async getStats(): Promise<any> {
    try {
      const response = await fetch(`${API_URL}?path=stats`);
      if (!response.ok) {
        throw new Error('Ошибка загрузки статистики');
      }
      
      const data = await response.json();
      console.log('📊 Статистика загружена:', data);
      return data;
    } catch (error) {
      console.error('❌ Ошибка загрузки статистики:', error);
      throw error;
    }
  },

  async getMediaFile(mediaId: string): Promise<string> {
    try {
      if (!mediaId || mediaId.length < 5) {
        return '';
      }

      const cachedMedia = await this.getMediaFromIndexedDB(mediaId);
      if (cachedMedia) {
        return cachedMedia;
      }

      if (mediaId.startsWith('audio_')) {
        try {
          const { getAudioFromIndexedDB } = await import('./audioStorage');
          const audioUrl = await getAudioFromIndexedDB(mediaId);
          if (audioUrl) {
            return audioUrl;
          }
        } catch (vintageAudioError) {
          console.log(`Аудио ${mediaId} не найдено в VintageAudioDB, пробую сервер`);
        }
      }

      const response = await fetch(`${API_URL}?path=media&id=${mediaId}`);
      if (!response.ok) {
        console.warn(`Медиафайл ${mediaId} не найден`);
        return '';
      }

      const data = await response.json();
      const mediaData = data.data || '';
      
      if (mediaData) {
        await this.saveMediaToIndexedDB(mediaId, mediaData);
      }
      
      return mediaData;
    } catch (error) {
      console.error('❌ Ошибка загрузки медиафайла:', error);
      return '';
    }
  },

  async getMediaFromIndexedDB(mediaId: string): Promise<string | null> {
    return new Promise((resolve) => {
      const request = indexedDB.open('MediaStorage', 1);
      
      request.onerror = () => resolve(null);
      
      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('media')) {
          db.createObjectStore('media', { keyPath: 'id' });
        }
      };
      
      request.onsuccess = (event: any) => {
        const db = event.target.result;
        
        if (!db.objectStoreNames.contains('media')) {
          resolve(null);
          return;
        }
        
        const transaction = db.transaction(['media'], 'readonly');
        const store = transaction.objectStore('media');
        const getRequest = store.get(mediaId);
        
        getRequest.onsuccess = () => {
          resolve(getRequest.result?.data || null);
        };
        
        getRequest.onerror = () => resolve(null);
      };
    });
  },

  async saveMediaToIndexedDB(mediaId: string, data: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MediaStorage', 1);
      
      request.onerror = () => reject(new Error('IndexedDB error'));
      
      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('media')) {
          db.createObjectStore('media', { keyPath: 'id' });
        }
      };
      
      request.onsuccess = (event: any) => {
        const db = event.target.result;
        const transaction = db.transaction(['media'], 'readwrite');
        const store = transaction.objectStore('media');
        
        store.put({ id: mediaId, data });
        
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(new Error('Transaction error'));
      };
    });
  }
};