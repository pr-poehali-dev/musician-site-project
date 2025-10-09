import { useState, useEffect } from 'react';
import { Album, Track } from '@/types';

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
    const savedAlbums = localStorage.getItem('albums');
    if (savedAlbums) {
      setAlbums(JSON.parse(savedAlbums));
    } else {
      localStorage.setItem('albums', JSON.stringify(defaultAlbums));
    }
  }, []);

  const addNewAlbum = (albumData: Omit<Album, 'id'>) => {
    try {
      const newAlbum: Album = {
        ...albumData,
        id: Date.now().toString()
      };
      console.log('Добавление нового альбома:', newAlbum);
      const updatedAlbums = [...albums, newAlbum];
      console.log('Обновленный список альбомов:', updatedAlbums);
      
      const dataToSave = JSON.stringify(updatedAlbums);
      const dataSizeKB = (dataToSave.length / 1024).toFixed(2);
      console.log('Размер данных для сохранения:', dataSizeKB + ' KB');
      
      let totalSize = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length + key.length;
        }
      }
      console.log('Текущий размер localStorage:', (totalSize / 1024).toFixed(2) + ' KB');
      console.log('Размер после добавления:', ((totalSize + dataToSave.length) / 1024).toFixed(2) + ' KB');
      
      setAlbums(updatedAlbums);
      localStorage.setItem('albums', dataToSave);
      console.log('✅ Альбом успешно сохранен в localStorage');
      window.dispatchEvent(new CustomEvent('albumsUpdated'));
    } catch (error) {
      console.error('❌ Ошибка при сохранении альбома в localStorage:', error);
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        alert('⚠️ Недостаточно места в хранилище браузера!\n\n' +
              'Решения:\n' +
              '1. Удалите старые альбомы через админ-панель\n' +
              '2. Вместо загрузки файла используйте ссылку на изображение (поле "или вставьте ссылку на обложку")\n' +
              '3. Используйте изображения меньшего размера (до 500KB)\n\n' +
              'Рекомендуем загружать обложки на imgur.com или использовать прямые ссылки.');
      } else {
        alert('Ошибка при сохранении альбома: ' + (error as Error).message);
      }
      throw error;
    }
  };

  const editAlbum = (albumId: string, albumData: Omit<Album, 'id'>) => {
    const updatedAlbums = albums.map(album => 
      album.id === albumId 
        ? { ...album, ...albumData } 
        : album
    );
    setAlbums(updatedAlbums);
    localStorage.setItem('albums', JSON.stringify(updatedAlbums));
    window.dispatchEvent(new CustomEvent('albumsUpdated'));
  };

  const removeAlbum = (albumId: string) => {
    const updatedAlbums = albums.filter(album => album.id !== albumId);
    setAlbums(updatedAlbums);
    localStorage.setItem('albums', JSON.stringify(updatedAlbums));
    window.dispatchEvent(new CustomEvent('albumsUpdated'));
    window.dispatchEvent(new CustomEvent('tracksUpdated'));
  };

  const addTrackToAlbum = (albumId: string, trackData: Omit<Track, 'id'>) => {
    const newTrack: Track = {
      ...trackData,
      id: Date.now().toString()
    };
    
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
    
    const savedTracks = localStorage.getItem('uploadedTracks');
    let uploadedTracks = [];
    if (savedTracks) {
      uploadedTracks = JSON.parse(savedTracks);
    }
    uploadedTracks.push(newTrack);
    localStorage.setItem('uploadedTracks', JSON.stringify(uploadedTracks));
    
    window.dispatchEvent(new CustomEvent('tracksUpdated'));
    window.dispatchEvent(new CustomEvent('albumsUpdated'));
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