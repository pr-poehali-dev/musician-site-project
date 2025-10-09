import { useState, useEffect } from 'react';
import { Album, Track } from '@/types';
import { apiClient } from '@/utils/apiClient';
import { musicApi } from '@/utils/musicApi';

const defaultAlbums: Album[] = [
  { 
    id: "album1", 
    title: "Винтажные Мелодии", 
    artist: "Vintage Soul",
    tracks: 4, 
    price: 899, 
    cover: "/img/d10a9c15-7d7f-41eb-b586-bff4324f107a.jpg",
    description: "Полный альбом атмосферной винтажной музыки",
    trackList: [
      { id: "1", title: "Vintage Dreams", duration: "3:42", file: "", price: 129 },
      { id: "2", title: "Golden Memories", duration: "4:15", file: "", price: 129 },
      { id: "3", title: "Sunset Boulevard", duration: "3:28", file: "", price: 129 },
      { id: "4", title: "Old Soul", duration: "4:03", file: "", price: 129 }
    ]
  },
  { 
    id: "album2", 
    title: "Золотые Годы", 
    artist: "Vintage Soul",
    tracks: 3, 
    price: 749, 
    cover: "/img/d10a9c15-7d7f-41eb-b586-bff4324f107a.jpg",
    description: "Коллекция лучших ретро композиций",
    trackList: [
      { id: "5", title: "Jazz Cafe Nights", duration: "5:12", file: "", price: 149 },
      { id: "6", title: "Midnight Train", duration: "4:33", file: "", price: 149 },
      { id: "7", title: "Blue Moon Rising", duration: "3:55", file: "", price: 149 }
    ]
  }
];

export const useAlbumManagement = () => {
  const [albums, setAlbums] = useState<Album[]>(defaultAlbums);

  useEffect(() => {
    const loadAlbums = async () => {
      try {
        console.log('[Albums] Загрузка альбомов из базы данных...');
        const dbAlbums = await musicApi.getAlbums();
        
        if (dbAlbums.length > 0) {
          console.log('[Albums] Загружено из БД:', dbAlbums.length, 'альбомов');
          setAlbums(dbAlbums);
        } else {
          console.log('[Albums] БД пуста, инициализация дефолтными альбомами');
          for (const album of defaultAlbums) {
            await musicApi.createAlbum(album);
          }
          const newAlbums = await musicApi.getAlbums();
          setAlbums(newAlbums);
        }
      } catch (error) {
        console.error('[Albums] Ошибка загрузки из БД:', error);
        setAlbums(defaultAlbums);
      }
    };
    
    loadAlbums();
  }, []);

  const addNewAlbum = async (albumData: Omit<Album, 'id'>) => {
    try {
      console.log('[Albums] Создание нового альбома:', albumData.title);
      const createdAlbum = await musicApi.createAlbum(albumData);
      
      if (createdAlbum) {
        const updatedAlbums = await musicApi.getAlbums();
        setAlbums(updatedAlbums);
        console.log('✅ Альбом успешно сохранен в БД');
        window.dispatchEvent(new CustomEvent('albumsUpdated'));
      } else {
        throw new Error('Не удалось создать альбом');
      }
    } catch (error) {
      console.error('❌ Ошибка при сохранении альбома:', error);
      alert('Ошибка при сохранении альбома: ' + (error as Error).message);
      throw error;
    }
  };

  const editAlbum = async (albumId: string, albumData: Omit<Album, 'id'>) => {
    try {
      await musicApi.updateAlbum(albumId, albumData);
      const updatedAlbums = await musicApi.getAlbums();
      setAlbums(updatedAlbums);
      window.dispatchEvent(new CustomEvent('albumsUpdated'));
    } catch (error) {
      console.error('Ошибка редактирования альбома:', error);
    }
  };

  const removeAlbum = async (albumId: string) => {
    try {
      const updatedAlbums = albums.filter(album => album.id !== albumId);
      setAlbums(updatedAlbums);
      window.dispatchEvent(new CustomEvent('albumsUpdated'));
      window.dispatchEvent(new CustomEvent('tracksUpdated'));
    } catch (error) {
      console.error('Ошибка удаления альбома:', error);
    }
  };

  const addTrackToAlbum = async (albumId: string, trackData: Omit<Track, 'id'>) => {
    try {
      console.log('[Tracks] Создание нового трека в альбоме:', albumId);
      const createdTrack = await musicApi.createTrack({ ...trackData, albumId });
      
      if (createdTrack) {
        const updatedAlbums = await musicApi.getAlbums();
        setAlbums(updatedAlbums);
        console.log('✅ Трек сохранен в БД');
        window.dispatchEvent(new CustomEvent('tracksUpdated'));
        window.dispatchEvent(new CustomEvent('albumsUpdated'));
      } else {
        throw new Error('Не удалось создать трек');
      }
    } catch (error) {
      console.error('❌ Ошибка при сохранении трека:', error);
      alert('Ошибка при сохранении трека: ' + (error as Error).message);
      throw error;
    }
  };

  const moveTrack = async (trackId: string, fromAlbumId: string, toAlbumId: string) => {
    try {
      await musicApi.updateTrack(trackId, { albumId: toAlbumId });
      const updatedAlbums = await musicApi.getAlbums();
      setAlbums(updatedAlbums);
      window.dispatchEvent(new CustomEvent('albumsUpdated'));
    } catch (error) {
      console.error('Ошибка перемещения трека:', error);
    }
  };

  return {
    albums,
    setAlbums,
    addNewAlbum,
    editAlbum,
    removeAlbum,
    addTrackToAlbum,
    moveTrack
  };
};