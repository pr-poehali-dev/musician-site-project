import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Icon from '@/components/ui/icon';
import { Album } from '@/types';

interface AddTrackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newTrack: {
    title: string;
    duration: string;
    file: string;
    price: number;
    cover: string;
  };
  onTrackChange: (track: any) => void;
  uploadedFile: File | null;
  isUploading: boolean;
  isSaving: boolean;
  savedFilePath: string | null;
  fileError: string | null;
  selectedAlbum: string;
  onAlbumChange: (albumId: string) => void;
  albums: Album[];
  coverPreview: string | null;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCoverUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSaveAudioFile: () => void;
  onAddTrack: () => void;
  fileInputKey: number;
}

const AddTrackDialog: React.FC<AddTrackDialogProps> = ({
  open,
  onOpenChange,
  newTrack,
  onTrackChange,
  uploadedFile,
  isUploading,
  isSaving,
  savedFilePath,
  fileError,
  selectedAlbum,
  onAlbumChange,
  albums,
  coverPreview,
  onFileUpload,
  onCoverUpload,
  onSaveAudioFile,
  onAddTrack,
  fileInputKey
}) => {
  const isButtonDisabled = !newTrack.title || !newTrack.duration || (!newTrack.file && !savedFilePath) || !selectedAlbum;
  
  console.log('🔘 [AddTrackDialog] Состояние кнопки "Добавить трек":', {
    disabled: isButtonDisabled,
    hasTitle: !!newTrack.title,
    hasDuration: !!newTrack.duration,
    hasFile: !!newTrack.file,
    hasSavedFilePath: !!savedFilePath,
    savedFilePathLength: savedFilePath?.length || 0,
    hasAlbum: !!selectedAlbum
  });
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-vintage-dark-brown hover:bg-vintage-warm text-vintage-cream">
          <Icon name="Plus" size={16} className="mr-2" />
          Добавить трек
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-vintage-cream border-vintage-brown/20">
        <DialogHeader>
          <DialogTitle className="text-vintage-warm">Новый трек</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="track-title" className="text-vintage-warm">Название</Label>
            <Input
              id="track-title"
              value={newTrack.title}
              onChange={(e) => onTrackChange({...newTrack, title: e.target.value})}
              placeholder="Название трека"
              className="border-vintage-brown/30 focus:border-vintage-dark-brown"
            />
          </div>
          <div>
            <Label htmlFor="track-duration" className="text-vintage-warm">Длительность</Label>
            <Input
              id="track-duration"
              value={newTrack.duration}
              onChange={(e) => onTrackChange({...newTrack, duration: e.target.value})}
              placeholder="3:42"
              className="border-vintage-brown/30 focus:border-vintage-dark-brown"
            />
          </div>
          <div>
            <Label className="text-vintage-warm">Аудиофайл</Label>
            <div className="space-y-2">
              <input
                key={`audio-${fileInputKey}`}
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
                        <span className="text-xs text-green-600">Сохранено: {savedFilePath}</span>
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={onSaveAudioFile}
                    disabled={!uploadedFile || !newTrack.title.trim() || isSaving || savedFilePath !== null}
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
                        Сохранено
                      </>
                    ) : (
                      <>
                        <Icon name="Save" size={14} className="mr-1" />
                        Сохранить
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div>
            <Label className="text-vintage-warm">Обложка трека (необязательно)</Label>
            <div className="space-y-2">
              <input
                key={`cover-${fileInputKey}`}
                type="file"
                accept="image/*"
                onChange={onCoverUpload}
                className="w-full px-3 py-2 border border-vintage-brown/30 rounded-md focus:border-vintage-dark-brown bg-vintage-cream file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-vintage-dark-brown file:text-vintage-cream hover:file:bg-vintage-warm"
              />
              {coverPreview && (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-vintage-brown/20">
                  <img src={coverPreview} alt="Обложка" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="track-price" className="text-vintage-warm">Цена (₽)</Label>
            <Input
              id="track-price"
              type="number"
              value={newTrack.price}
              onChange={(e) => onTrackChange({...newTrack, price: Number(e.target.value)})}
              placeholder="129"
              className="border-vintage-brown/30 focus:border-vintage-dark-brown"
            />
          </div>
          <div>
            <Label htmlFor="track-album" className="text-vintage-warm">Альбом (необязательно)</Label>
            <select
              id="track-album"
              value={selectedAlbum}
              onChange={(e) => onAlbumChange(e.target.value)}
              className="w-full px-3 py-2 border border-vintage-brown/30 rounded-md focus:border-vintage-dark-brown bg-vintage-cream"
            >
              <option value="">Без альбома</option>
              {albums.map((album) => (
                <option key={album.id} value={album.id}>
                  {album.title}
                </option>
              ))}
            </select>
          </div>
          
          {fileError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <Icon name="AlertCircle" size={16} className="text-red-600" />
              <span className="text-sm text-red-600">{fileError}</span>
            </div>
          )}
          
          <Button 
            onClick={onAddTrack}
            disabled={isButtonDisabled}
            className="w-full bg-vintage-dark-brown hover:bg-vintage-warm text-vintage-cream disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Добавить трек
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddTrackDialog;