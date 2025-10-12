import { useState, useEffect, useRef } from 'react';
import { Album, Track } from '@/types';
import { apiClient } from '@/utils/apiClient';

const POLLING_INTERVAL = 5000; // Обновление каждые 5 секунд

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
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Загрузка альбомов с автообновлением
  const loadAlbums = async () => {
    try {
      const serverAlbums = await apiClient.loadAlbumsFromServer();
      
      if (serverAlbums.length > 0) {
        setAlbums(serverAlbums);
        localStorage.setItem('albums', JSON.stringify(serverAlbums));
        console.log('✅ Альбомы обновлены из БД:', serverAlbums.length);
      } else {
        const savedAlbums = localStorage.getItem('albums');
        if (savedAlbums) {
          const parsed = JSON.parse(savedAlbums);
          setAlbums(parsed);
        } else {
          setAlbums(defaultAlbums);
          localStorage.setItem('albums', JSON.stringify(defaultAlbums));
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки альбомов:', error);
      const savedAlbums = localStorage.getItem('albums');
      if (savedAlbums) {
        setAlbums(JSON.parse(savedAlbums));
      } else {
        setAlbums(defaultAlbums);
        localStorage.setItem('albums', JSON.stringify(defaultAlbums));
      }
    }
  };

  useEffect(() => {
    // Загружаем альбомы сразу
    loadAlbums();

    // Запускаем автообновление
    pollingIntervalRef.current = setInterval(() => {
      loadAlbums();
    }, POLLING_INTERVAL);

    // Слушаем события для немедленного обновления
    const handleAlbumsUpdate = () => {
      loadAlbums();
    };

    window.addEventListener('albumsUpdated', handleAlbumsUpdate);

    // Очистка
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      window.removeEventListener('albumsUpdated', handleAlbumsUpdate);
    };
  }, []);

  const addNewAlbum = async (albumData: Omit<Album, 'id'>) => {
    try {
      const newAlbum: Album = {
        ...albumData,
        id: Date.now().toString()
      };
      console.log('Добавление нового альбома:', newAlbum);
      
      await apiClient.saveAlbumToServer(newAlbum);
      
      const updatedAlbums = [...albums, newAlbum];
      console.log('Обновленный список альбомов:', updatedAlbums);
      
      const dataToSave = JSON.stringify(updatedAlbums);
      const dataSizeKB = (dataToSave.length / 1024).toFixed(2);
      console.log('Размер данных для сохранения:', dataSizeKB + ' KB');
      
      setAlbums(updatedAlbums);
      localStorage.setItem('albums', dataToSave);
      console.log('✅ Альбом успешно сохранен в localStorage и на сервере');
      window.dispatchEvent(new CustomEvent('albumsUpdated'));
    } catch (error) {
      console.error('❌ Ошибка при сохранении альбома:', error);
      alert('Ошибка при сохранении альбома: ' + (error as Error).message);
      throw error;
    }
  };

  const editAlbum = async (albumId: string, albumData: Omit<Album, 'id'>) => {
    try {
      await apiClient.updateAlbumOnServer(albumId, albumData);
      
      const updatedAlbums = albums.map(album => 
        album.id === albumId 
          ? { ...album, ...albumData } 
          : album
      );
      setAlbums(updatedAlbums);
      localStorage.setItem('albums', JSON.stringify(updatedAlbums));
      window.dispatchEvent(new CustomEvent('albumsUpdated'));
    } catch (error) {
      console.error('❌ Ошибка при редактировании альбома:', error);
      alert('Ошибка при редактировании альбома: ' + (error as Error).message);
    }
  };

  const removeAlbum = async (albumId: string) => {
    try {
      await apiClient.deleteAlbumFromServer(albumId);
      
      const updatedAlbums = albums.filter(album => album.id !== albumId);
      setAlbums(updatedAlbums);
      localStorage.setItem('albums', JSON.stringify(updatedAlbums));
      window.dispatchEvent(new CustomEvent('albumsUpdated'));
      window.dispatchEvent(new CustomEvent('tracksUpdated'));
      
      console.log('✅ Альбом удален:', albumId);
    } catch (error) {
      console.error('❌ Ошибка при удалении альбома:', error);
      alert('Ошибка при удалении альбома: ' + (error as Error).message);
    }
  };

  const addTrackToAlbum = async (albumId: string, trackData: Omit<Track, 'id'>) => {
    try {
      const newTrack: Track = {
        ...trackData,
        id: Date.now().toString(),
        albumId
      };
      
      await apiClient.saveTrackToServer(newTrack);
      
      const updatedAlbums = albums.map(album => 
        album.id === albumId 
          ? { 
              ...album, 
              trackList: [...album.trackList, newTrack],
              tracks: album.trackList.length + 1
            } 
          : album
      );
      setAlbums(updatedAlbums);
      localStorage.setItem('albums', JSON.stringify(updatedAlbums));
      
      console.log('✅ Трек сохранен в базу данных на сервере');
      
      window.dispatchEvent(new CustomEvent('tracksUpdated'));
      window.dispatchEvent(new CustomEvent('albumsUpdated'));
    } catch (error) {
      console.error('❌ Ошибка при сохранении трека:', error);
      alert('Ошибка при сохранении трека: ' + (error as Error).message);
      throw error;
    }
  };

  const moveTrack = (trackId: string, fromAlbumId: string, toAlbumId: string) => {
    const sourceAlbum = albums.find(album => album.id === fromAlbumId);
    const trackToMove = sourceAlbum?.trackList.find(track => track.id === trackId);
    
    if (!trackToMove) return;

    const updatedAlbums = albums.map(album => {
      if (album.id === fromAlbumId) {
        return {
          ...album,
          trackList: album.trackList.filter(track => track.id !== trackId)
        };
      }
      if (album.id === toAlbumId) {
        return {
          ...album,
          trackList: [...album.trackList, trackToMove]
        };
      }
      return album;
    });

    setAlbums(updatedAlbums);
    localStorage.setItem('albums', JSON.stringify(updatedAlbums));
    window.dispatchEvent(new CustomEvent('albumsUpdated'));
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