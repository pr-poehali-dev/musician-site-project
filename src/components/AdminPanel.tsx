import React, { useState } from 'react';
import AlbumManager from '@/components/admin/AlbumManager';
import TrackManager from '@/components/admin/TrackManager';
import { Track, Album } from '@/types';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { exportTracksBackup, importTracksBackup, getBackupSize } from '@/utils/trackBackup';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportTracksBackup();
      toast({
        title: "✅ Экспорт завершен",
        description: "Резервная копия успешно сохранена",
      });
    } catch (error) {
      toast({
        title: "❌ Ошибка экспорта",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      setIsImporting(true);
      try {
        await importTracksBackup(file);
        toast({
          title: "✅ Импорт завершен",
          description: "Резервная копия успешно восстановлена. Обновите страницу.",
        });
        setTimeout(() => window.location.reload(), 2000);
      } catch (error) {
        toast({
          title: "❌ Ошибка импорта",
          description: (error as Error).message,
          variant: "destructive",
        });
      } finally {
        setIsImporting(false);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      {/* Резервное копирование */}
      <div className="bg-vintage-brown/10 p-4 rounded-lg border border-vintage-brown/20">
        <h3 className="text-lg font-semibold text-vintage-dark-brown mb-3 flex items-center gap-2">
          <Icon name="Database" size={20} />
          Резервное копирование
        </h3>
        <div className="flex flex-wrap gap-3 items-center">
          <Button
            onClick={handleExport}
            disabled={isExporting || albums.length === 0}
            className="bg-vintage-dark-brown hover:bg-vintage-warm text-vintage-cream"
          >
            <Icon name="Download" size={16} className="mr-2" />
            {isExporting ? 'Экспорт...' : 'Экспортировать'}
          </Button>
          
          <Button
            onClick={handleImport}
            disabled={isImporting}
            variant="outline"
            className="border-vintage-dark-brown text-vintage-dark-brown hover:bg-vintage-dark-brown hover:text-vintage-cream"
          >
            <Icon name="Upload" size={16} className="mr-2" />
            {isImporting ? 'Импорт...' : 'Импортировать'}
          </Button>
          
          <span className="text-sm text-vintage-warm/70">
            Размер данных: {getBackupSize()}
          </span>
        </div>
        <p className="text-xs text-vintage-warm/60 mt-2">
          Экспорт сохранит все альбомы, треки и аудиофайлы в один файл. Импорт восстановит все данные из файла.
        </p>
      </div>

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