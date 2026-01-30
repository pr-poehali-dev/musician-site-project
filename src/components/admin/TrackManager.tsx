import React, { useState } from 'react';
import { Track, Album } from '@/types';
import AddTrackDialog from './track/AddTrackDialog';
import TrackListItem from './track/TrackListItem';

interface TrackManagerProps {
  albums: Album[];
  tracks: Track[];
  onAddTrack: (albumId: string, track: Omit<Track, 'id'>) => void;
  onRemoveTrack: (trackId: string) => void;
}

const TrackManager: React.FC<TrackManagerProps> = ({
  albums,
  tracks,
  onAddTrack,
  onRemoveTrack
}) => {
  const [newTrack, setNewTrack] = useState({
    title: '',
    duration: '',
    file: '',
    price: 129,
    cover: ''
  });

  const [selectedAlbum, setSelectedAlbum] = useState('');
  const [showAddTrack, setShowAddTrack] = useState(false);

  const resetTrackForm = () => {
    setNewTrack({
      title: '',
      duration: '',
      file: '',
      price: 129,
      cover: ''
    });
    setSelectedAlbum('');
  };

  const handleAddTrack = async () => {
    if (newTrack.title && newTrack.file && selectedAlbum) {
      const trackToSave = {
        ...newTrack,
        cover: newTrack.cover || '' // Обложка необязательна
      };
      
      onAddTrack(selectedAlbum, trackToSave);
      resetTrackForm();
      setShowAddTrack(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-vintage-warm">Треки</h3>
        <AddTrackDialog
          open={showAddTrack}
          onOpenChange={setShowAddTrack}
          newTrack={newTrack}
          onTrackChange={setNewTrack}
          selectedAlbum={selectedAlbum}
          onAlbumChange={setSelectedAlbum}
          albums={albums}
          onAddTrack={handleAddTrack}
        />
      </div>

      <div className="space-y-2">
        {tracks.map((track) => (
          <TrackListItem
            key={track.id}
            track={track}
            onRemove={onRemoveTrack}
          />
        ))}
      </div>
    </div>
  );
};

export default TrackManager;