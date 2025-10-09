import React, { useState, useCallback } from 'react';
import { Track, Album } from '@/types';
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
    description: ''
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
    description: ''
  });
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null);
  const [editCoverPreview, setEditCoverPreview] = useState<string | null>(null);

  const handleAddAlbum = async () => {
    if (newAlbum.title && newAlbum.artist) {
      let coverUrl = newAlbum.cover;
      
      if (coverFile) {
        coverUrl = await saveCoverImage(coverFile);
      }
      
      onAddAlbum({
        ...newAlbum,
        cover: coverUrl,
        tracks: 0,
        trackList: []
      });
      setNewAlbum({
        title: '',
        artist: '',
        cover: '',
        price: 0,
        description: ''
      });
      setCoverFile(null);
      setCoverPreview(null);
      setShowAddAlbum(false);
    }
  };

  const saveCoverImage = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        resolve(result);
      };
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
      description: album.description
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
      let coverUrl = editAlbumData.cover;
      
      if (editCoverFile) {
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
        description: ''
      });
      setEditCoverFile(null);
      setEditCoverPreview(null);
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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-vintage-warm">Альбомы</h3>
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