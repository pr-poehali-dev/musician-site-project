import { Album, Track } from '@/types';
import { convertYandexDiskUrl } from './yandexDisk';

const API_URL = 'https://functions.poehali.dev/25aac639-cf81-4eb7-80fc-aa9a157a25e6';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export const musicApi = {
  async getAlbums(): Promise<Album[]> {
    try {
      const response = await fetch(`${API_URL}?path=albums`);
      if (!response.ok) throw new Error('Failed to fetch albums');
      const albums = await response.json();
      return albums.map((album: any) => ({
        ...album,
        tracks: album.tracks_count || album.trackList?.length || 0,
        trackList: album.trackList || []
      }));
    } catch (error) {
      console.error('Ошибка загрузки альбомов:', error);
      return [];
    }
  },

  async getTracks(albumId?: string): Promise<Track[]> {
    try {
      const url = albumId 
        ? `${API_URL}?path=tracks&album_id=${albumId}`
        : `${API_URL}?path=tracks`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch tracks');
      return await response.json();
    } catch (error) {
      console.error('Ошибка загрузки треков:', error);
      return [];
    }
  },

  async getStats(trackId?: string): Promise<any> {
    try {
      const url = trackId 
        ? `${API_URL}?path=stats&track_id=${trackId}`
        : `${API_URL}?path=stats`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch stats');
      return await response.json();
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
      return null;
    }
  },

  async createAlbum(albumData: Omit<Album, 'id'>): Promise<Album | null> {
    try {
      const response = await fetch(`${API_URL}?path=album`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: Date.now().toString(),
          ...albumData,
          tracks_count: 0
        })
      });
      if (!response.ok) throw new Error('Failed to create album');
      return await response.json();
    } catch (error) {
      console.error('Ошибка создания альбома:', error);
      return null;
    }
  },

  async updateAlbum(albumId: string, albumData: Partial<Album>): Promise<Album | null> {
    try {
      const response = await fetch(`${API_URL}?path=album`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: albumId, ...albumData })
      });
      if (!response.ok) throw new Error('Failed to update album');
      return await response.json();
    } catch (error) {
      console.error('Ошибка обновления альбома:', error);
      return null;
    }
  },

  async createTrack(trackData: Omit<Track, 'id'>): Promise<Track | null> {
    try {
      const response = await fetch(`${API_URL}?path=track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: Date.now().toString(),
          ...trackData,
          album_id: trackData.albumId || ''
        })
      });
      if (!response.ok) throw new Error('Failed to create track');
      return await response.json();
    } catch (error) {
      console.error('Ошибка создания трека:', error);
      return null;
    }
  },

  async updateTrack(trackId: string, trackData: Partial<Track>): Promise<Track | null> {
    try {
      const response = await fetch(`${API_URL}?path=track`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: trackId, 
          ...trackData,
          album_id: trackData.albumId || ''
        })
      });
      if (!response.ok) throw new Error('Failed to update track');
      return await response.json();
    } catch (error) {
      console.error('Ошибка обновления трека:', error);
      return null;
    }
  },

  async incrementPlay(trackId: string): Promise<void> {
    try {
      await fetch(`${API_URL}?path=stat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track_id: trackId, type: 'play' })
      });
    } catch (error) {
      console.error('Ошибка записи воспроизведения:', error);
    }
  },

  async incrementDownload(trackId: string): Promise<void> {
    try {
      await fetch(`${API_URL}?path=stat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track_id: trackId, type: 'download' })
      });
    } catch (error) {
      console.error('Ошибка записи скачивания:', error);
    }
  },

  async getTrackFile(trackId: string): Promise<string | null> {
    try {
      const response = await fetch(`${API_URL}?path=track-file&id=${trackId}`);
      if (!response.ok) throw new Error('Failed to fetch track file');
      const data = await response.json();
      const fileUrl = data.file || null;
      
      if (!fileUrl) return null;
      
      if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
        return await convertYandexDiskUrl(fileUrl);
      }
      
      if (fileUrl.startsWith('audio_')) {
        const response = await fetch(`${API_URL}?path=track-stream&file_key=${encodeURIComponent(fileUrl)}`);
        if (response.redirected) {
          return response.url;
        }
        return `${API_URL}?path=track-stream&file_key=${encodeURIComponent(fileUrl)}`;
      }
      
      return null;
    } catch (error) {
      console.error('Ошибка загрузки файла трека:', error);
      return null;
    }
  }
};