import { Album, Track } from '@/types';

const API_URL = 'https://functions.poehali.dev/25aac639-cf81-4eb7-80fc-aa9a157a25e6';

export const apiClient = {
  async saveTrackToServer(track: Track): Promise<void> {
    const response = await fetch(`${API_URL}?path=track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: track.id,
        album_id: track.albumId || '',
        title: track.title,
        duration: track.duration,
        file: track.file,
        price: track.price,
        cover: track.cover || '',
        track_order: 0
      })
    });
    
    if (!response.ok) {
      throw new Error('Ошибка сохранения трека на сервере');
    }
    
    console.log('✅ Трек сохранен в базу данных:', track.title);
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
      
      return albums.map((album: any) => ({
        id: album.id,
        title: album.title,
        artist: album.artist,
        tracks: album.tracks_count || 0,
        price: album.price,
        cover: album.cover,
        description: album.description,
        trackList: (album.trackList || []).map((track: any) => ({
          id: track.id,
          title: track.title,
          duration: track.duration,
          file: track.file,
          price: track.price,
          cover: track.cover || '',
          albumId: album.id
        }))
      }));
    } catch (error) {
      console.error('Ошибка загрузки альбомов:', error);
      return [];
    }
  }
};