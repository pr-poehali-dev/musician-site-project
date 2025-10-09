import { Album, Track } from '@/types';

export const apiClient = {
  async saveTrackToServer(track: Track): Promise<void> {
    console.log('Трек сохранен локально (серверное хранилище будет добавлено):', track);
  },

  async saveAlbumToServer(album: Album): Promise<void> {
    console.log('Альбом сохранен локально (серверное хранилище будет добавлено):', album);
  },

  async loadAlbumsFromServer(): Promise<Album[]> {
    return [];
  }
};