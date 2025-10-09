import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Album, Track } from '@/types';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { saveAudioToIndexedDB } from '@/utils/audioStorage';
import { validateAudioFile } from '@/utils/fileUtils';

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
  currentFileName?: string;
}

export const EditTrackDialog: React.FC<EditTrackDialogProps> = ({
  open,
  onOpenChange,
  editTrackData,
  onTrackDataChange,
  onSaveEditTrack,
  currentFileName
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setUploadError(null);
    setNewFileName(null);
    
    if (!file) return;
    
    const validation = validateAudioFile(file);
    if (!validation.isValid) {
      setUploadError(validation.error || 'Неподдерживаемый файл');
      return;
    }
    
    setIsUploading(true);
    
    try {
      const fileId = await saveAudioToIndexedDB(file, file.name);
      
      const audio = new Audio();
      const audioUrl = URL.createObjectURL(file);
      audio.src = audioUrl;
      
      audio.addEventListener('loadedmetadata', () => {
        const minutes = Math.floor(audio.duration / 60);
        const seconds = Math.floor(audio.duration % 60);
        const duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        onTrackDataChange({
          ...editTrackData,
          file: fileId,
          duration
        });
        
        setNewFileName(file.name);
        setIsUploading(false);
        URL.revokeObjectURL(audioUrl);
      });
      
      audio.addEventListener('error', () => {
        setUploadError('Ошибка загрузки аудиофайла');
        setIsUploading(false);
        URL.revokeObjectURL(audioUrl);
      });
    } catch (error) {
      console.error('Ошибка загрузки файла:', error);
      setUploadError('Ошибка сохранения файла');
      setIsUploading(false);
    }
  };
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
          
          <div>
            <Label htmlFor="edit-track-file" className="text-vintage-warm mb-2 block">
              Аудиофайл
            </Label>
            <div className="space-y-2">
              {editTrackData.file && !newFileName && (
                <div className="flex items-center gap-2 p-2 bg-vintage-brown/10 rounded border border-vintage-brown/20">
                  <Icon name="Music" size={16} className="text-vintage-dark-brown" />
                  <span className="text-sm text-vintage-warm flex-1">
                    {currentFileName || 'Текущий файл загружен'}
                  </span>
                  <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-300">
                    Есть файл
                  </Badge>
                </div>
              )}
              {newFileName && (
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-300">
                  <Icon name="CheckCircle2" size={16} className="text-green-600" />
                  <span className="text-sm text-green-700 flex-1">{newFileName}</span>
                  <Badge className="bg-green-600 text-white">Новый файл</Badge>
                </div>
              )}
              <Input
                id="edit-track-file"
                type="file"
                accept="audio/*,.mp3,.wav,.ogg,.m4a"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="border-vintage-brown/30 focus:border-vintage-dark-brown cursor-pointer"
              />
              {isUploading && (
                <div className="flex items-center gap-2 text-sm text-vintage-warm/70">
                  <Icon name="Loader2" size={16} className="animate-spin" />
                  Загрузка файла...
                </div>
              )}
              {uploadError && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <Icon name="AlertCircle" size={14} />
                  {uploadError}
                </p>
              )}
              <p className="text-xs text-vintage-warm/60">
                Форматы: MP3, WAV, OGG, M4A (макс. 50 МБ)
              </p>
            </div>
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