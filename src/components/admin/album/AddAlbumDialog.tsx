import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Icon from '@/components/ui/icon';

interface AddAlbumDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newAlbum: {
    title: string;
    artist: string;
    cover: string;
    price: number;
    description: string;
    year?: number;
  };
  onAlbumChange: (album: any) => void;
  coverPreview: string | null;
  onCoverUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddAlbum: () => void;
}

const AddAlbumDialog: React.FC<AddAlbumDialogProps> = ({
  open,
  onOpenChange,
  newAlbum,
  onAlbumChange,
  coverPreview,
  onCoverUpload,
  onAddAlbum
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-vintage-dark-brown hover:bg-vintage-warm text-vintage-cream">
          <Icon name="Plus" size={16} className="mr-2" />
          Добавить альбом
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-vintage-cream border-vintage-brown/20">
        <DialogHeader>
          <DialogTitle className="text-vintage-warm">Новый альбом</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="album-title" className="text-vintage-warm">Название</Label>
            <Input
              id="album-title"
              value={newAlbum.title}
              onChange={(e) => onAlbumChange({...newAlbum, title: e.target.value})}
              placeholder="Название альбома"
              className="border-vintage-brown/30 focus:border-vintage-dark-brown"
            />
          </div>
          <div>
            <Label htmlFor="album-artist" className="text-vintage-warm">Исполнитель</Label>
            <Input
              id="album-artist"
              value={newAlbum.artist}
              onChange={(e) => onAlbumChange({...newAlbum, artist: e.target.value})}
              placeholder="Имя исполнителя"
              className="border-vintage-brown/30 focus:border-vintage-dark-brown"
            />
          </div>
          <div>
            <Label htmlFor="album-year" className="text-vintage-warm">Год выпуска</Label>
            <Input
              id="album-year"
              type="number"
              value={newAlbum.year || ''}
              onChange={(e) => onAlbumChange({...newAlbum, year: e.target.value ? Number(e.target.value) : undefined})}
              placeholder="2024"
              className="border-vintage-brown/30 focus:border-vintage-dark-brown"
            />
          </div>
          <div>
            <Label htmlFor="album-cover" className="text-vintage-warm">Обложка</Label>
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={onCoverUpload}
                className="w-full px-3 py-2 border border-vintage-brown/30 rounded-md focus:border-vintage-dark-brown bg-vintage-cream file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-vintage-dark-brown file:text-vintage-cream hover:file:bg-vintage-warm"
              />
              <p className="text-xs text-vintage-warm/60">
                ⚡ Изображение будет сжато до 400x400px. Для больших альбомов рекомендуем использовать ссылку на изображение.
              </p>
              {coverPreview && (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-vintage-brown/20">
                  <img src={coverPreview} alt="Предпросмотр" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="text-sm text-vintage-warm/60">или</div>
              <Input
                id="album-cover"
                value={newAlbum.cover}
                onChange={(e) => onAlbumChange({...newAlbum, cover: e.target.value})}
                placeholder="Вставьте ссылку на обложку"
                className="border-vintage-brown/30 focus:border-vintage-dark-brown"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="album-price" className="text-vintage-warm">Цена (₽)</Label>
            <Input
              id="album-price"
              type="number"
              value={newAlbum.price}
              onChange={(e) => onAlbumChange({...newAlbum, price: Number(e.target.value)})}
              placeholder="Цена альбома"
              className="border-vintage-brown/30 focus:border-vintage-dark-brown"
            />
          </div>
          <div>
            <Label htmlFor="album-description" className="text-vintage-warm">Описание</Label>
            <Textarea
              id="album-description"
              value={newAlbum.description}
              onChange={(e) => onAlbumChange({...newAlbum, description: e.target.value})}
              placeholder="Описание альбома"
              className="border-vintage-brown/30 focus:border-vintage-dark-brown"
            />
          </div>
          <Button 
            onClick={() => {
              console.log('Кнопка "Создать альбом" нажата');
              onAddAlbum();
            }}
            className="w-full bg-vintage-dark-brown hover:bg-vintage-warm text-vintage-cream"
          >
            Создать альбом
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddAlbumDialog;