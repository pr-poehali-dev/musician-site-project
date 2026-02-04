import React, { useState, useCallback } from 'react';
import { Track, Album } from '@/types';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import AddAlbumDialog from './album/AddAlbumDialog';
import EditAlbumDialog from './album/EditAlbumDialog';
import { EditTrackDialog, MoveTrackDialog, BulkMoveDialog } from './album/TrackDialogs';
import AlbumCard from './album/AlbumCard';

interface AlbumManagerProps {
  albums: Album[];
  onAddAlbum: (album: Omit<Album, 'id'>) => void;
  onEditAlbum: (albumId: string, albumData: Omit<Album, 'id'>) => void;
  onRemoveAlbum: (albumId: string) => void;
  onRemoveTrack?: (trackId: string) => void;
  onEditTrack?: (trackId: string, trackData: Omit<Track, 'id'>) => void;
  onMoveTrack?: (trackId: string, fromAlbumId: string, toAlbumId: string) => void;
}

const AlbumManager: React.FC<AlbumManagerProps> = ({
  albums,
  onAddAlbum,
  onEditAlbum,
  onRemoveAlbum,
  onRemoveTrack,
  onEditTrack,
  onMoveTrack
}) => {
  const [expandedAlbums, setExpandedAlbums] = useState<string[]>([]);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [showEditTrack, setShowEditTrack] = useState(false);
  const [editTrackData, setEditTrackData] = useState({
    title: '',
    duration: '',
    price: 0,
    file: ''
  });

  const [movingTrack, setMovingTrack] = useState<{track: Track, albumId: string} | null>(null);
  const [showMoveTrack, setShowMoveTrack] = useState(false);
  const [targetAlbumId, setTargetAlbumId] = useState('');
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
  const [showBulkMove, setShowBulkMove] = useState(false);
  const [bulkMoveAlbumId, setBulkMoveAlbumId] = useState('');
  const [bulkMoveTargetId, setBulkMoveTargetId] = useState('');
  const [newAlbum, setNewAlbum] = useState({
    title: '',
    artist: '',
    cover: '',
    price: 0,
    description: '',
    year: undefined as number | undefined
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [showAddAlbum, setShowAddAlbum] = useState(false);
  const [showEditAlbum, setShowEditAlbum] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [editAlbumData, setEditAlbumData] = useState({
    title: '',
    artist: '',
    cover: '',
    price: 0,
    description: '',
    year: undefined as number | undefined
  });
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null);
  const [editCoverPreview, setEditCoverPreview] = useState<string | null>(null);

  const handleAddAlbum = async () => {
    console.log('handleAddAlbum вызван, данные:', newAlbum);
    if (newAlbum.title && newAlbum.artist) {
      try {
        let coverUrl = newAlbum.cover;
        
        if (coverFile) {
          console.log('Загрузка обложки из файла, размер:', (coverFile.size / 1024).toFixed(2) + ' KB');
          coverUrl = await saveCoverImage(coverFile);
        }
        
        const albumData = {
          ...newAlbum,
          cover: coverUrl,
          tracks: 0,
          trackList: []
        };
        
        console.log('Вызов onAddAlbum с данными:', albumData);
        onAddAlbum(albumData);
        
        setNewAlbum({
          title: '',
          artist: '',
          cover: '',
          price: 0,
          description: '',
          year: undefined
        });
        setCoverFile(null);
        setCoverPreview(null);
        setShowAddAlbum(false);
        console.log('Альбом успешно добавлен, диалог закрыт');
      } catch (error) {
        console.error('Ошибка при добавлении альбома:', error);
        alert('Ошибка при загрузке обложки. Попробуйте использовать изображение меньшего размера или вставьте ссылку на обложку.');
      }
    } else {
      console.log('Не заполнены обязательные поля:', { title: newAlbum.title, artist: newAlbum.artist });
      alert('Пожалуйста, заполните название и исполнителя');
    }
  };

  const saveCoverImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.5);
          const sizeKB = (compressedDataUrl.length / 1024).toFixed(2);
          console.log('Изображение сжато:', {
            original: ((e.target?.result?.toString().length || 0) / 1024).toFixed(2) + ' KB',
            compressed: sizeKB + ' KB',
            dimensions: `${width}x${height}`
          });
          
          if (compressedDataUrl.length > 200000) {
            console.warn('Изображение все еще большое:', sizeKB, 'KB. Рекомендуется использовать URL.');
          }
          
          resolve(compressedDataUrl);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditAlbum = (album: Album) => {
    setEditingAlbum(album);
    setEditAlbumData({
      title: album.title,
      artist: album.artist,
      cover: album.cover,
      price: album.price,
      description: album.description,
      year: album.year
    });
    setEditCoverPreview(album.cover || null);
    setShowEditAlbum(true);
  };

  const handleEditCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setEditCoverFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditCoverPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEditAlbum = async () => {
    if (editingAlbum && editAlbumData.title && editAlbumData.artist) {
      try {
        let coverUrl = editAlbumData.cover;
        
        if (editCoverFile) {
          console.log('Загрузка новой обложки при редактировании, размер:', (editCoverFile.size / 1024).toFixed(2) + ' KB');
          coverUrl = await saveCoverImage(editCoverFile);
        }
        
        onEditAlbum(editingAlbum.id, {
          ...editAlbumData,
          cover: coverUrl,
          tracks: editingAlbum.tracks,
          trackList: editingAlbum.trackList
        });
        setShowEditAlbum(false);
        setEditingAlbum(null);
        setEditAlbumData({
          title: '',
          artist: '',
          cover: '',
          price: 0,
          description: '',
          year: undefined
        });
        setEditCoverFile(null);
        setEditCoverPreview(null);
        console.log('Альбом успешно обновлен');
      } catch (error) {
        console.error('Ошибка при редактировании альбома:', error);
        alert('Ошибка при загрузке обложки. Попробуйте использовать изображение меньшего размера или вставьте ссылку на обложку.');
      }
    }
  };

  const handleDeleteAlbum = useCallback((albumId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот альбом?')) {
      onRemoveAlbum(albumId);
    }
  }, [onRemoveAlbum]);

  const handleDeleteTrack = useCallback((trackId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот трек?')) {
      onRemoveTrack?.(trackId);
    }
  }, [onRemoveTrack]);

  const toggleAlbumExpanded = useCallback((albumId: string) => {
    setExpandedAlbums(prev => 
      prev.includes(albumId) 
        ? prev.filter(id => id !== albumId)
        : [...prev, albumId]
    );
  }, []);

  const handleEditTrack = useCallback((track: Track) => {
    setEditingTrack(track);
    setEditTrackData({
      title: track.title,
      duration: track.duration,
      price: track.price,
      file: track.file
    });
    setShowEditTrack(true);
  }, []);



  const handleSaveEditTrack = useCallback(() => {
    if (editingTrack && editTrackData.title && editTrackData.duration) {
      onEditTrack?.(editingTrack.id, editTrackData);
      setShowEditTrack(false);
      setEditingTrack(null);
      setEditTrackData({
        title: '',
        duration: '',
        price: 0,
        file: ''
      });
    }
  }, [editingTrack, editTrackData, onEditTrack]);

  const handleMoveTrack = useCallback((track: Track, albumId: string) => {
    setMovingTrack({track, albumId});
    setTargetAlbumId('');
    setShowMoveTrack(true);
  }, []);

  const handleSaveMoveTrack = useCallback(() => {
    if (movingTrack && targetAlbumId && targetAlbumId !== movingTrack.albumId) {
      onMoveTrack?.(movingTrack.track.id, movingTrack.albumId, targetAlbumId);
      setShowMoveTrack(false);
      setMovingTrack(null);
      setTargetAlbumId('');
    }
  }, [movingTrack, targetAlbumId, onMoveTrack]);

  const handleToggleTrackSelection = useCallback((trackId: string) => {
    setSelectedTracks(prev => 
      prev.includes(trackId) 
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  }, []);

  const handleBulkMove = useCallback((albumId: string) => {
    if (selectedTracks.length === 0) return;
    setBulkMoveAlbumId(albumId);
    setBulkMoveTargetId('');
    setShowBulkMove(true);
  }, [selectedTracks]);

  const handleSaveBulkMove = useCallback(() => {
    if (bulkMoveAlbumId && bulkMoveTargetId && bulkMoveTargetId !== bulkMoveAlbumId) {
      selectedTracks.forEach(trackId => {
        onMoveTrack?.(trackId, bulkMoveAlbumId, bulkMoveTargetId);
      });
      setShowBulkMove(false);
      setSelectedTracks([]);
      setBulkMoveAlbumId('');
      setBulkMoveTargetId('');
    }
  }, [bulkMoveAlbumId, bulkMoveTargetId, selectedTracks, onMoveTrack]);

  const handleSelectAllTracksInAlbum = useCallback((albumId: string) => {
    const album = albums.find(a => a.id === albumId);
    if (album?.trackList) {
      const trackIds = album.trackList.map(t => t.id);
      const allSelected = trackIds.every(id => selectedTracks.includes(id));
      if (allSelected) {
        setSelectedTracks(prev => prev.filter(id => !trackIds.includes(id)));
      } else {
        setSelectedTracks(prev => [...new Set([...prev, ...trackIds])]);
      }
    }
  }, [albums, selectedTracks]);

  const checkStorageSize = () => {
    let totalSize = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length + key.length;
      }
    }
    const sizeKB = (totalSize / 1024).toFixed(2);
    const limitKB = 5120;
    const percentUsed = ((totalSize / 1024 / limitKB) * 100).toFixed(1);
    
    alert(`📊 Использование хранилища браузера:\n\n` +
          `Занято: ${sizeKB} KB из ~${limitKB} KB (${percentUsed}%)\n\n` +
          `Совет: Если места мало, используйте ссылки на изображения вместо загрузки файлов.`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-vintage-warm">Альбомы</h3>
        <div className="flex gap-2">
          <Button
            onClick={checkStorageSize}
            variant="outline"
            size="sm"
            className="border-vintage-brown text-vintage-dark-brown hover:bg-vintage-brown/10"
          >
            <Icon name="HardDrive" size={16} className="mr-2" />
            Проверить место
          </Button>
          <AddAlbumDialog
            open={showAddAlbum}
            onOpenChange={setShowAddAlbum}
            newAlbum={newAlbum}
            onAlbumChange={setNewAlbum}
            coverPreview={coverPreview}
            onCoverUpload={handleCoverUpload}
            onAddAlbum={handleAddAlbum}
          />
        </div>
      </div>

      <BulkMoveDialog
        open={showBulkMove}
        onOpenChange={setShowBulkMove}
        selectedTracksCount={selectedTracks.length}
        bulkMoveAlbumId={bulkMoveAlbumId}
        bulkMoveTargetId={bulkMoveTargetId}
        onTargetChange={setBulkMoveTargetId}
        albums={albums}
        onSaveBulkMove={handleSaveBulkMove}
      />

      <MoveTrackDialog
        open={showMoveTrack}
        onOpenChange={setShowMoveTrack}
        movingTrack={movingTrack}
        targetAlbumId={targetAlbumId}
        onTargetAlbumChange={setTargetAlbumId}
        albums={albums}
        onSaveMoveTrack={handleSaveMoveTrack}
      />

      <EditTrackDialog
        open={showEditTrack}
        onOpenChange={setShowEditTrack}
        editTrackData={editTrackData}
        onTrackDataChange={setEditTrackData}
        onSaveEditTrack={handleSaveEditTrack}
      />

      <EditAlbumDialog
        open={showEditAlbum}
        onOpenChange={setShowEditAlbum}
        editAlbumData={editAlbumData}
        onAlbumDataChange={setEditAlbumData}
        editCoverPreview={editCoverPreview}
        onEditCoverUpload={handleEditCoverUpload}
        onSaveEditAlbum={handleSaveEditAlbum}
      />

      <div className="grid md:grid-cols-2 gap-4">
        {albums.map((album) => (
          <AlbumCard
            key={album.id}
            album={album}
            isExpanded={expandedAlbums.includes(album.id)}
            selectedTracks={selectedTracks}
            onToggleExpanded={() => toggleAlbumExpanded(album.id)}
            onSelectAllTracks={() => handleSelectAllTracksInAlbum(album.id)}
            onBulkMove={() => handleBulkMove(album.id)}
            onEdit={() => handleEditAlbum(album)}
            onDelete={() => handleDeleteAlbum(album.id)}
            onToggleTrackSelection={handleToggleTrackSelection}
            onMoveTrack={handleMoveTrack}
            onEditTrack={handleEditTrack}
            onDeleteTrack={handleDeleteTrack}
          />
        ))}
      </div>
    </div>
  );
};

export default AlbumManager;