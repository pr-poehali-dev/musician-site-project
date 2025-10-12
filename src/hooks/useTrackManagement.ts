import { useState, useCallback } from 'react';
import { Track, Album } from '@/types';
import { useRealtimeSync } from './useRealtimeSync';
import { toast } from '@/hooks/use-toast';

const API_URL = 'https://functions.poehali.dev/25aac639-cf81-4eb7-80fc-aa9a157a25e6';

export const useTrackManagement = (albums: Album[], setAlbums: (albums: Album[]) => void) => {
  const [tracks, setTracks] = useState<Track[]>([]);

  // Загружаем треки из базы данных
  const loadTracksFromDB = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}?path=tracks`);
      if (response.ok) {
        const data = await response.json();
        setTracks(data || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки треков:', error);
    }
  }, []);

  // Автоматическое обновление отключено
  // const { isOnline, lastSyncTime } = useRealtimeSync({
  //   onSync: loadTracksFromDB,
  //   pollingInterval: 5000,
  //   enableVisibilityDetection: true
  // });

  const removeTrack = async (trackId: string) => {
    try {
      // Удаляем из базы данных
      const response = await fetch(`${API_URL}?path=track&id=${trackId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Обновляем локальное состояние
        setTracks(prevTracks => prevTracks.filter(track => track.id !== trackId));
        
        // Обновляем альбомы
        const updatedAlbums = albums.map(album => ({
          ...album,
          trackList: album.trackList.filter(track => track.id !== trackId),
          tracks: album.trackList.filter(track => track.id !== trackId).length
        }));
        setAlbums(updatedAlbums);
        
        toast({
          title: "✅ Трек удален",
          description: "Трек успешно удален из базы данных",
        });
        
        window.dispatchEvent(new CustomEvent('tracksUpdated'));
        window.dispatchEvent(new CustomEvent('albumsUpdated'));
      }
    } catch (error) {
      console.error('Ошибка удаления трека:', error);
      toast({
        title: "❌ Ошибка",
        description: "Не удалось удалить трек",
        variant: "destructive",
      });
    }
  };

  const editTrack = async (trackId: string, trackData: Omit<Track, 'id'>) => {
    try {
      // Обновляем в базе данных
      const response = await fetch(`${API_URL}?path=track`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: trackId,
          title: trackData.title,
          duration: trackData.duration,
          file: trackData.file,
          price: trackData.price,
          track_order: 0
        })
      });

      if (response.ok) {
        // Обновляем локальное состояние
        setTracks(prevTracks => prevTracks.map(track => 
          track.id === trackId ? { ...track, ...trackData } : track
        ));
        
        // Обновляем альбомы
        const updatedAlbums = albums.map(album => ({
          ...album,
          trackList: album.trackList.map(track => 
            track.id === trackId ? { ...track, ...trackData } : track
          )
        }));
        setAlbums(updatedAlbums);
        
        toast({
          title: "✅ Трек обновлен",
          description: "Изменения сохранены в базе данных",
        });
        
        window.dispatchEvent(new CustomEvent('tracksUpdated'));
        window.dispatchEvent(new CustomEvent('albumsUpdated'));
      }
    } catch (error) {
      console.error('Ошибка обновления трека:', error);
      toast({
        title: "❌ Ошибка",
        description: "Не удалось обновить трек",
        variant: "destructive",
      });
    }
  };

  return {
    tracks,
    setTracks,
    removeTrack,
    editTrack
  };
};