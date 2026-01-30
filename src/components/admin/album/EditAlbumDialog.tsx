import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface EditAlbumDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editAlbumData: {
    title: string;
    artist: string;
    cover: string;
    price: number;
    description: string;
    year?: number;
  };
  onAlbumDataChange: (data: any) => void;
  editCoverPreview: string | null;
  onEditCoverUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSaveEditAlbum: () => void;
}

const EditAlbumDialog: React.FC<EditAlbumDialogProps> = ({
  open,
  onOpenChange,
  editAlbumData,
  onAlbumDataChange,
  editCoverPreview,
  onEditCoverUpload,
  onSaveEditAlbum
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-vintage-cream border-vintage-brown/20">
        <DialogHeader>
          <DialogTitle className="text-vintage-warm">Редактировать альбом</DialogTitle>
          <DialogDescription className="text-vintage-brown">Измените информацию об альбоме</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-album-title" className="text-vintage-warm">Название</Label>
            <Input
              id="edit-album-title"
              value={editAlbumData.title}
              onChange={(e) => onAlbumDataChange({...editAlbumData, title: e.target.value})}
              placeholder="Название альбома"
              className="border-vintage-brown/30 focus:border-vintage-dark-brown"
            />
          </div>
          <div>
            <Label htmlFor="edit-album-artist" className="text-vintage-warm">Исполнитель</Label>
            <Input
              id="edit-album-artist"
              value={editAlbumData.artist}
              onChange={(e) => onAlbumDataChange({...editAlbumData, artist: e.target.value})}
              placeholder="Имя исполнителя"
              className="border-vintage-brown/30 focus:border-vintage-dark-brown"
            />
          </div>
          <div>
            <Label htmlFor="edit-album-year" className="text-vintage-warm">Год выпуска</Label>
            <Input
              id="edit-album-year"
              type="number"
              value={editAlbumData.year || ''}
              onChange={(e) => onAlbumDataChange({...editAlbumData, year: e.target.value ? Number(e.target.value) : undefined})}
              placeholder="2024"
              className="border-vintage-brown/30 focus:border-vintage-dark-brown"
            />
          </div>
          <div>
            <Label htmlFor="edit-album-cover" className="text-vintage-warm">Обложка</Label>
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={onEditCoverUpload}
                className="w-full px-3 py-2 border border-vintage-brown/30 rounded-md focus:border-vintage-dark-brown bg-vintage-cream file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-vintage-dark-brown file:text-vintage-cream hover:file:bg-vintage-warm"
              />
              {editCoverPreview && (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-vintage-brown/20">
                  <img src={editCoverPreview} alt="Предпросмотр" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="text-sm text-vintage-warm/60">или</div>
              <Input
                id="edit-album-cover"
                value={editAlbumData.cover}
                onChange={(e) => onAlbumDataChange({...editAlbumData, cover: e.target.value})}
                placeholder="Вставьте ссылку на обложку"
                className="border-vintage-brown/30 focus:border-vintage-dark-brown"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="edit-album-price" className="text-vintage-warm">Цена (₽)</Label>
            <Input
              id="edit-album-price"
              type="number"
              value={editAlbumData.price}
              onChange={(e) => onAlbumDataChange({...editAlbumData, price: Number(e.target.value)})}
              placeholder="Цена альбома"
              className="border-vintage-brown/30 focus:border-vintage-dark-brown"
            />
          </div>
          <div>
            <Label htmlFor="edit-album-description" className="text-vintage-warm">Описание</Label>
            <Textarea
              id="edit-album-description"
              value={editAlbumData.description}
              onChange={(e) => onAlbumDataChange({...editAlbumData, description: e.target.value})}
              placeholder="Описание альбома"
              className="border-vintage-brown/30 focus:border-vintage-dark-brown"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={onSaveEditAlbum}
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

export default EditAlbumDialog;