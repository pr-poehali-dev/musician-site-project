import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Album, Track } from '@/types';
import Icon from '@/components/ui/icon';

interface EditTrackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTrackData: {
    title: string;
    duration: string;
    price: number;
    file: string;
  };
  onTrackDataChange: (data: any) => void;
  onSaveEditTrack: () => void;
  onFileUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadedFile?: File | null;
  isUploading?: boolean;
  isSaving?: boolean;
  savedFilePath?: string | null;
  onSaveAudioFile?: () => void;
  fileInputKey?: number;
}

export const EditTrackDialog: React.FC<EditTrackDialogProps> = ({
  open,
  onOpenChange,
  editTrackData,
  onTrackDataChange,
  onSaveEditTrack,
  onFileUpload,
  uploadedFile,
  isUploading = false,
  isSaving = false,
  savedFilePath,
  onSaveAudioFile,
  fileInputKey = 0
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-vintage-cream border-vintage-brown/20">
        <DialogHeader>
          <DialogTitle className="text-vintage-warm">Редактировать трек</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-track-title" className="text-vintage-warm">Название</Label>
            <Input
              id="edit-track-title"
              value={editTrackData.title}
              onChange={(e) => onTrackDataChange({...editTrackData, title: e.target.value})}
              placeholder="Название трека"
              className="border-vintage-brown/30 focus:border-vintage-dark-brown"
            />
          </div>
          <div>
            <Label htmlFor="edit-track-duration" className="text-vintage-warm">Длительность</Label>
            <Input
              id="edit-track-duration"
              value={editTrackData.duration}
              onChange={(e) => onTrackDataChange({...editTrackData, duration: e.target.value})}
              placeholder="3:42"
              className="border-vintage-brown/30 focus:border-vintage-dark-brown"
            />
          </div>
          {onFileUpload && (
            <div>
              <Label className="text-vintage-warm">Аудиофайл (загрузить новый)</Label>
              <div className="space-y-2">
                <input
                  key={`edit-audio-${fileInputKey}`}
                  type="file"
                  accept="audio/*"
                  onChange={onFileUpload}
                  className="w-full px-3 py-2 border border-vintage-brown/30 rounded-md focus:border-vintage-dark-brown bg-vintage-cream file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-vintage-dark-brown file:text-vintage-cream hover:file:bg-vintage-warm"
                />
                {uploadedFile && (
                  <div className="flex items-center gap-2 p-2 bg-vintage-brown/10 rounded">
                    <Icon name="Music" size={16} className="text-vintage-dark-brown" />
                    <div className="flex-1">
                      <span className="text-sm text-vintage-warm block">{uploadedFile.name}</span>
                      {isUploading && (
                        <span className="text-xs text-vintage-warm/60">Обработка...</span>
                      )}
                      {savedFilePath && (
                        <div className="flex items-center gap-1 mt-1">
                          <Icon name="CheckCircle" size={12} className="text-green-600" />
                          <span className="text-xs text-green-600">Файл готов к сохранению</span>
                        </div>
                      )}
                    </div>
                    {onSaveAudioFile && (
                      <Button
                        onClick={onSaveAudioFile}
                        disabled={!uploadedFile || isSaving || savedFilePath !== null}
                        variant="outline"
                        size="sm"
                        className="border-vintage-dark-brown text-vintage-dark-brown hover:bg-vintage-dark-brown hover:text-vintage-cream"
                      >
                        {isSaving ? (
                          <>
                            <Icon name="Loader2" size={14} className="mr-1 animate-spin" />
                            Сохраняем
                          </>
                        ) : savedFilePath ? (
                          <>
                            <Icon name="CheckCircle" size={14} className="mr-1" />
                            Готово
                          </>
                        ) : (
                          <>
                            <Icon name="Save" size={14} className="mr-1" />
                            Обработать
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}
                {editTrackData.file && !uploadedFile && (
                  <div className="text-xs text-vintage-warm/60">
                    <Icon name="CheckCircle" size={12} className="inline mr-1 text-green-600" />
                    Текущий файл загружен
                  </div>
                )}
              </div>
            </div>
          )}
          <div>
            <Label htmlFor="edit-track-price" className="text-vintage-warm">Цена (₽)</Label>
            <Input
              id="edit-track-price"
              type="number"
              value={editTrackData.price}
              onChange={(e) => onTrackDataChange({...editTrackData, price: Number(e.target.value)})}
              placeholder="Цена трека"
              className="border-vintage-brown/30 focus:border-vintage-dark-brown"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={onSaveEditTrack}
              className="flex-1 bg-vintage-dark-brown hover:bg-vintage-warm text-vintage-cream"
            >
              Сохранить изменения
            </Button>
            <Button 
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="border-vintage-brown text-vintage-dark-brown hover:bg-vintage-brown hover:text-vintage-cream"
            >
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface MoveTrackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movingTrack: {track: Track, albumId: string} | null;
  targetAlbumId: string;
  onTargetAlbumChange: (id: string) => void;
  albums: Album[];
  onSaveMoveTrack: () => void;
}

export const MoveTrackDialog: React.FC<MoveTrackDialogProps> = ({
  open,
  onOpenChange,
  movingTrack,
  targetAlbumId,
  onTargetAlbumChange,
  albums,
  onSaveMoveTrack
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-vintage-cream border-vintage-brown/20">
        <DialogHeader>
          <DialogTitle className="text-vintage-warm">Переместить трек</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-vintage-warm mb-2 block">Трек: {movingTrack?.track.title}</Label>
            <Label htmlFor="target-album" className="text-vintage-warm">Переместить в альбом:</Label>
            <Select value={targetAlbumId} onValueChange={onTargetAlbumChange}>
              <SelectTrigger className="border-vintage-brown/30 focus:border-vintage-dark-brown">
                <SelectValue placeholder="Выберите альбом" />
              </SelectTrigger>
              <SelectContent>
                {albums
                  .filter(album => album.id !== movingTrack?.albumId)
                  .map(album => (
                    <SelectItem key={album.id} value={album.id}>
                      {album.title} - {album.artist}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={onSaveMoveTrack}
              disabled={!targetAlbumId}
              className="flex-1 bg-vintage-dark-brown hover:bg-vintage-warm text-vintage-cream disabled:opacity-50"
            >
              Переместить
            </Button>
            <Button 
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="border-vintage-brown text-vintage-dark-brown hover:bg-vintage-brown hover:text-vintage-cream"
            >
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface BulkMoveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTracksCount: number;
  bulkMoveAlbumId: string;
  bulkMoveTargetId: string;
  onTargetChange: (id: string) => void;
  albums: Album[];
  onSaveBulkMove: () => void;
}

export const BulkMoveDialog: React.FC<BulkMoveDialogProps> = ({
  open,
  onOpenChange,
  selectedTracksCount,
  bulkMoveAlbumId,
  bulkMoveTargetId,
  onTargetChange,
  albums,
  onSaveBulkMove
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-vintage-cream border-vintage-brown/20">
        <DialogHeader>
          <DialogTitle className="text-vintage-warm">Массовое перемещение треков</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-vintage-warm mb-2 block">Выбрано треков: {selectedTracksCount}</Label>
            <Label htmlFor="bulk-target-album" className="text-vintage-warm">Переместить в альбом:</Label>
            <Select value={bulkMoveTargetId} onValueChange={onTargetChange}>
              <SelectTrigger className="border-vintage-brown/30 focus:border-vintage-dark-brown">
                <SelectValue placeholder="Выберите альбом" />
              </SelectTrigger>
              <SelectContent>
                {albums
                  .filter(album => album.id !== bulkMoveAlbumId)
                  .map(album => (
                    <SelectItem key={album.id} value={album.id}>
                      {album.title} - {album.artist}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={onSaveBulkMove}
              disabled={!bulkMoveTargetId}
              className="flex-1 bg-vintage-dark-brown hover:bg-vintage-warm text-vintage-cream disabled:opacity-50"
            >
              Переместить ({selectedTracksCount})
            </Button>
            <Button 
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="border-vintage-brown text-vintage-dark-brown hover:bg-vintage-brown hover:text-vintage-cream"
            >
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};