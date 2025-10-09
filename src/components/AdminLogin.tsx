import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AdminPanel from '@/components/AdminPanel';
import { Track, Album } from '@/types';

interface AdminLoginProps {
  isAdmin: boolean;
  showAdminPanel: boolean;
  setShowAdminPanel: (show: boolean) => void;
  albums: Album[];
  tracks: Track[];
  handleAdminLogout: () => void;
  addNewAlbum: (album: Omit<Album, 'id'>) => void;
  editAlbum: (albumId: string, albumData: Omit<Album, 'id'>) => void;
  removeAlbum: (albumId: string) => void;
  addTrackToAlbum: (albumId: string, track: Omit<Track, 'id'>) => void;
  removeTrack: (trackId: string) => void;
  editTrack: (trackId: string, trackData: Omit<Track, 'id'>) => void;
  moveTrack: (trackId: string, fromAlbumId: string, toAlbumId: string) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({
  isAdmin,
  showAdminPanel,
  setShowAdminPanel,
  albums,
  tracks,
  handleAdminLogout,
  addNewAlbum,
  editAlbum,
  removeAlbum,
  addTrackToAlbum,
  removeTrack,
  editTrack,
  moveTrack
}) => {
  if (!isAdmin) return null;

  return (
    <Dialog open={showAdminPanel} onOpenChange={setShowAdminPanel}>
      <DialogContent className="bg-vintage-cream border-vintage-brown/20 max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-vintage-warm flex items-center justify-between">
            Админ панель
            <Button 
              onClick={handleAdminLogout}
              variant="outline"
              size="sm"
              className="border-vintage-brown text-vintage-dark-brown hover:bg-vintage-brown hover:text-vintage-cream"
            >
              Выйти
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <AdminPanel 
          albums={albums}
          tracks={tracks}
          onAddAlbum={addNewAlbum}
          onEditAlbum={editAlbum}
          onRemoveAlbum={removeAlbum}
          onAddTrack={addTrackToAlbum}
          onRemoveTrack={removeTrack}
          onEditTrack={editTrack}
          onMoveTrack={moveTrack}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AdminLogin;