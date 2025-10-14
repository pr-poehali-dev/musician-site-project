import { Album, Track } from '@/types';

const API_URL = 'https://functions.poehali.dev/25aac639-cf81-4eb7-80fc-aa9a157a25e6';

export const apiClient = {
  async saveTrackToServer(track: Track): Promise<void> {
    // На сервер отправляем только метаданные (БЕЗ аудио - слишком большой файл)
    const requestData = {
      id: track.id,
      album_id: track.albumId || '',
      title: track.title,
      duration: track.duration,
      file: '', // Аудио НЕ сохраняем (только в памяти браузера)
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
        cover: '', // НЕ отправляем обложку (слишком большой размер)
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
        cover: '', // НЕ отправляем обложку (слишком большой размер)
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
      console.log('📦 Загружено альбомов с сервера:', albums.length);
      
      const processedAlbums = await Promise.all(albums.map(async (album: any) => {
        let coverUrl = album.cover || '';
        console.log(`🎨 Альбом "${album.title}" - оригинальная обложка:`, coverUrl);
        
        if (coverUrl && coverUrl.startsWith('cover_')) {
          console.log(`⏳ Загружаем обложку ${coverUrl} из БД...`);
          const mediaData = await this.getMediaFile(coverUrl);
          if (mediaData) {
            coverUrl = mediaData;
            console.log(`✅ Обложка ${coverUrl.substring(0, 30)}... загружена`);
          } else {
            console.warn(`⚠️ Обложка ${coverUrl} не загрузилась`);
          }
        }
        
        const processedTracks = (album.trackList || []).map((track: any) => {
          const trackCover = track.cover || coverUrl;
          
          return {
            id: track.id,
            title: track.title,
            duration: track.duration,
            file: '', // Аудио не загружаем с сервера (хранится только локально)
            price: track.price,
            cover: trackCover,
            albumId: album.id
          };
        });
        
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

      console.log(`🔍 Загрузка медиафайла ${mediaId} с сервера...`);

      const response = await fetch(`${API_URL}?path=media&id=${mediaId}`);
      if (!response.ok) {
        console.warn(`⚠️ Медиафайл ${mediaId} не найден на сервере`);
        return '';
      }

      const data = await response.json();
      const mediaData = data.data || '';
      
      if (mediaData) {
        console.log(`✅ Медиафайл ${mediaId} загружен (${Math.round(mediaData.length / 1024)} KB)`);
      }
      
      return mediaData;
    } catch (error) {
      console.error('❌ Ошибка загрузки медиафайла:', error);
      return '';
    }
  },


};