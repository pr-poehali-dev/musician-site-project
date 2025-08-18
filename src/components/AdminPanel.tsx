import React from 'react';
import AlbumManager from '@/components/admin/AlbumManager';
import TrackManager from '@/components/admin/TrackManager';
import { Track, Album } from '@/types';

interface AdminPanelProps {
  albums: Album[];
  tracks: Track[];
  onAddAlbum: (album: Omit<Album, 'id'>) => void;
  onEditAlbum: (albumId: string, albumData: Omit<Album, 'id'>) => void;
  onRemoveAlbum: (albumId: string) => void;
  onAddTrack: (albumId: string, track: Omit<Track, 'id'>) => void;
  onRemoveTrack: (trackId: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  albums,
  tracks,
  onAddAlbum,
  onEditAlbum,
  onRemoveAlbum,
  onAddTrack,
  onRemoveTrack
}) => {
  return (
    <div className="space-y-6">
      {/* Управление альбомами */}
      <AlbumManager
        albums={albums}
        onAddAlbum={onAddAlbum}
        onEditAlbum={onEditAlbum}
        onRemoveAlbum={onRemoveAlbum}
      />

      {/* Управление треками */}
      <TrackManager
        albums={albums}
        tracks={tracks}
        onAddTrack={onAddTrack}
        onRemoveTrack={onRemoveTrack}
      />
    </div>
  );
};

export default AdminPanel;