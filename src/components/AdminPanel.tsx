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
  onEditTrack: (trackId: string, trackData: Omit<Track, 'id'>) => void;
  onMoveTrack: (trackId: string, fromAlbumId: string, toAlbumId: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  albums,
  tracks,
  onAddAlbum,
  onEditAlbum,
  onRemoveAlbum,
  onAddTrack,
  onRemoveTrack,
  onEditTrack,
  onMoveTrack
}) => {
  return (
    <div className="space-y-6">
      {/* Управление альбомами */}
      <AlbumManager
        albums={albums}
        onAddAlbum={onAddAlbum}
        onEditAlbum={onEditAlbum}
        onRemoveAlbum={onRemoveAlbum}
        onRemoveTrack={onRemoveTrack}
        onEditTrack={onEditTrack}
        onMoveTrack={onMoveTrack}
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