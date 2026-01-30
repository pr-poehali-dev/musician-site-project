import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import Icon from '@/components/ui/icon';
import { Album } from '@/types';
import { convertYandexDiskUrl } from '@/utils/yandexDisk';

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
  selectedAlbum: string;
  onAlbumChange: (albumId: string) => void;
  albums: Album[];
  onAddTrack: () => void;
}

const AddTrackDialog: React.FC<AddTrackDialogProps> = ({
  open,
  onOpenChange,
  newTrack,
  onTrackChange,
  selectedAlbum,
  onAlbumChange,
  albums,
  onAddTrack
}) => {
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string>('');
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  const isButtonDisabled = !newTrack.title || !newTrack.file || !selectedAlbum;

  useEffect(() => {
    const loadPreviewUrl = async () => {
      if (newTrack.file) {
        setLoadingPreview(true);
        setPreviewError(false);
        try {
          const url = await convertYandexDiskUrl(newTrack.file);
          setPreviewAudioUrl(url);
        } catch (error) {
          console.error('Ошибка загрузки превью:', error);
          setPreviewAudioUrl(newTrack.file);
        } finally {
          setLoadingPreview(false);
        }
      } else {
        setPreviewAudioUrl('');
      }
    };
    loadPreviewUrl();
  }, [newTrack.file]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-vintage-dark-brown hover:bg-vintage-warm text-vintage-cream">
          <Icon name="Plus" size={16} className="mr-2" />
          Добавить трек
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-vintage-cream border-vintage-brown/20 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-vintage-warm">Новый трек</DialogTitle>
          <DialogDescription className="text-vintage-brown">
            Добавьте новый трек с Яндекс.Диска
          </DialogDescription>
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
            <Label htmlFor="track-duration" className="text-vintage-warm">
              Длительность (в секундах, необязательно)
            </Label>
            <Input
              id="track-duration"
              type="number"
              value={newTrack.duration}
              onChange={(e) => onTrackChange({...newTrack, duration: e.target.value})}
              placeholder="210"
              className="border-vintage-brown/30 focus:border-vintage-dark-brown"
            />
            {newTrack.duration && (
              <p className="text-xs text-vintage-brown mt-1">
                = {Math.floor(Number(newTrack.duration) / 60)}:{(Number(newTrack.duration) % 60).toString().padStart(2, '0')}
              </p>
            )}
            <p className="text-xs text-vintage-brown/60 mt-1">
              Можно оставить пустым, определится автоматически при воспроизведении
            </p>
          </div>

          <div>
            <Label className="text-vintage-warm mb-3 block">Аудиофайл с Яндекс.Диска</Label>
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Icon name="Info" size={20} className="text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-blue-900 font-medium mb-2">Как загрузить трек</p>
                    <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                      <li>Загрузите аудио на <a href="https://disk.yandex.ru" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">Яндекс.Диск</a></li>
                      <li>Нажмите "Поделиться" → "Скопировать публичную ссылку"</li>
                      <li>Вставьте ссылку в поле ниже</li>
                    </ol>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="track-file" className="text-sm text-vintage-brown">
                  Ссылка с Яндекс.Диска
                </Label>
                <Input
                  id="track-file"
                  value={newTrack.file}
                  onChange={(e) => onTrackChange({...newTrack, file: e.target.value})}
                  placeholder="https://disk.yandex.ru/d/..."
                  type="url"
                  className="border-vintage-brown/30 focus:border-vintage-dark-brown mt-1"
                />
              </div>
            </div>
            
            {newTrack.file && (
              <div className="mt-3 p-4 bg-vintage-brown/5 rounded-lg border border-vintage-brown/20">
                <div className="flex items-center gap-3 mb-2">
                  {loadingPreview ? (
                    <Icon name="Loader2" size={16} className="text-vintage-warm animate-spin" />
                  ) : (
                    <Icon name="Music" size={16} className="text-vintage-warm" />
                  )}
                  <span className="text-sm font-medium text-vintage-dark-brown">
                    {loadingPreview ? 'Загрузка трека...' : 'Предпросмотр трека'}
                  </span>
                </div>
                {previewAudioUrl && !loadingPreview && (
                  <audio 
                    src={previewAudioUrl} 
                    controls 
                    className="w-full"
                    style={{ height: '40px' }}
                    onError={() => setPreviewError(true)}
                  />
                )}
                {previewError && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-2">
                    <Icon name="AlertCircle" size={12} />
                    Не удалось загрузить трек. Проверьте ссылку.
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="track-cover" className="text-vintage-warm">
              Обложка трека (необязательно)
            </Label>
            <Input
              id="track-cover"
              value={newTrack.cover}
              onChange={(e) => onTrackChange({...newTrack, cover: e.target.value})}
              placeholder="https://disk.yandex.ru/i/..."
              type="url"
              className="border-vintage-brown/30 focus:border-vintage-dark-brown"
            />
            <p className="text-xs text-vintage-brown/60 mt-1">
              Используйте ссылку с Яндекс.Диска с /i/ для изображений
            </p>
            {newTrack.cover && (
              <div className="mt-2">
                <img
                  src={newTrack.cover}
                  alt="Обложка"
                  className="w-24 h-24 object-cover rounded-lg border-2 border-vintage-brown/20"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
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
            <Label htmlFor="track-album" className="text-vintage-warm">Альбом *</Label>
            <select
              id="track-album"
              value={selectedAlbum}
              onChange={(e) => onAlbumChange(e.target.value)}
              className="w-full px-3 py-2 border border-vintage-brown/30 rounded-md focus:border-vintage-dark-brown bg-vintage-cream"
            >
              <option value="">Выберите альбом</option>
              {albums.map((album) => (
                <option key={album.id} value={album.id}>
                  {album.title}
                </option>
              ))}
            </select>
          </div>

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