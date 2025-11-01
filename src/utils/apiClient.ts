import { Album, Track } from '@/types';

const API_URL = 'https://functions.poehali.dev/25aac639-cf81-4eb7-80fc-aa9a157a25e6';

export const apiClient = {
  async saveMediaFile(mediaId: string, fileType: string, data: string): Promise<string> {
    console.log(`📤 [saveMediaFile] Сохранение ${fileType} файла ${mediaId}, размер: ${data.length} chars`);
    
    const response = await fetch(`${API_URL}?path=media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: mediaId,
        file_type: fileType,
        data: data
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [saveMediaFile] Ошибка сохранения медиафайла:`, errorText);
      throw new Error(`Ошибка сохранения медиафайла: ${response.status}`);
    }
    
    console.log(`✅ [saveMediaFile] Медиафайл ${mediaId} сохранён`);
    return mediaId;
  },

  async saveTrackToServer(track: Track): Promise<void> {
    console.log('📤 [saveTrackToServer] ========== НАЧАЛО ==========');
    console.log('📤 [saveTrackToServer] Входящий трек:', {
      id: track.id,
      title: track.title,
      hasFile: !!track.file,
      fileLength: track.file?.length || 0,
      filePreview: track.file?.substring(0, 50)
    });
    
    // Если файл большой (>1MB base64), сохраняем его отдельно
    let fileId = track.file || '';
    if (track.file && track.file.length > 100) {
      console.log('📤 [saveTrackToServer] Файл большой, сохраняем отдельно...');
      fileId = `audio_${track.id}`;
      
      try {
        await this.saveMediaFile(fileId, 'audio', track.file);
        console.log('✅ [saveTrackToServer] Аудиофайл сохранён отдельно:', fileId);
      } catch (error) {
        console.error('❌ [saveTrackToServer] Ошибка сохранения аудио:', error);
        throw new Error('Не удалось загрузить аудиофайл');
      }
    }
    
    // Отправляем данные трека с ID файла вместо base64
    const requestData = {
      id: track.id,
      album_id: track.albumId || '',
      title: track.title,
      duration: track.duration,
      file: fileId, // Теперь это ID файла, а не base64
      price: track.price,
      cover: track.cover || '',
      track_order: 0
    };
    
    console.log('📤 [saveTrackToServer] URL:', `${API_URL}?path=track`);
    console.log('📤 [saveTrackToServer] Данные для отправки:', {
      id: requestData.id,
      album_id: requestData.album_id,
      title: requestData.title,
      duration: requestData.duration,
      file: requestData.file.startsWith('audio_') ? `${requestData.file} (ID)` : 'EMPTY',
      price: requestData.price,
      cover: requestData.cover.length > 100 ? `${requestData.cover.substring(0, 30)}... (${requestData.cover.length} chars)` : requestData.cover || 'EMPTY',
      track_order: requestData.track_order
    });
    
    try {
      const jsonBody = JSON.stringify(requestData);
      const bodySizeMB = (jsonBody.length / 1024 / 1024).toFixed(2);
      console.log(`📤 [saveTrackToServer] Размер JSON тела запроса: ${bodySizeMB} MB`);
      
      if (jsonBody.length > 3000000) {
        console.error('❌ [saveTrackToServer] JSON слишком большой! Проверьте поле cover');
        throw new Error('Размер данных превышает лимит Cloud Functions (3MB)');
      }
      
      // Для больших файлов увеличиваем keepalive
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 секунд
      
      const response = await fetch(`${API_URL}?path=track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonBody,
        keepalive: true,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
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
    const albumData: any = {
      id: album.id,
      title: album.title,
      artist: album.artist,
      price: album.price,
      description: album.description || ''
    };
    
    // Отправляем обложку только если она есть
    if (album.cover && album.cover.length > 0) {
      albumData.cover = album.cover;
    }
    
    const response = await fetch(`${API_URL}?path=album`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(albumData)
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
    const updateData: any = {
      id: albumId,
      title: albumData.title,
      artist: albumData.artist,
      price: albumData.price,
      description: albumData.description || ''
    };
    
    // Отправляем обложку только если она есть
    if (albumData.cover && albumData.cover.length > 0) {
      updateData.cover = albumData.cover;
    }
    
    const response = await fetch(`${API_URL}?path=album`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
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
        
        const processedTracks = await Promise.all((album.trackList || []).map(async (track: any) => {
          const trackCover = track.cover || coverUrl;
          
          // Загружаем аудиофайл из базы данных
          let audioFile = track.file || '';
          if (audioFile && audioFile.startsWith('audio_')) {
            const audioData = await this.getMediaFile(audioFile);
            if (audioData) {
              audioFile = audioData;
            }
          }
          
          const processedTrack = {
            id: track.id,
            title: track.title,
            duration: track.duration,
            file: audioFile,
            price: track.price,
            cover: trackCover,
            albumId: album.id,
            plays_count: track.plays_count || 0
          };
          
          console.log(`🎵 Трек "${track.title}" - plays_count:`, track.plays_count);
          
          return processedTrack;
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

  async resetStats(): Promise<void> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Требуется авторизация. Пожалуйста, войдите в админку заново.');
      }

      const response = await fetch(`https://functions.poehali.dev/52119c2a-82db-4422-894d-e3d5db04d16a?path=stats/reset`, {
        method: 'DELETE',
        headers: {
          'X-Auth-Token': token,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('authToken');
        throw new Error('Сессия истекла. Пожалуйста, войдите в админку заново.');
      }

      if (!response.ok) {
        throw new Error('Ошибка сброса статистики');
      }

      console.log('🔄 Статистика в БД сброшена');
    } catch (error) {
      console.error('❌ Ошибка сброса статистики:', error);
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