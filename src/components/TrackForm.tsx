import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import AudioUploader from '@/components/AudioUploader';

interface TrackFormProps {
  onSubmit: (trackData: TrackFormData) => Promise<void>;
  onCancel: () => void;
  albumId: number;
}

export interface TrackFormData {
  title: string;
  album_id: number;
  duration: number;
  preview_url: string;
  file_url: string;
  price: number;
}

const TrackForm = ({ onSubmit, onCancel, albumId }: TrackFormProps) => {
  const [formData, setFormData] = useState<TrackFormData>({
    title: '',
    album_id: albumId,
    duration: 0,
    preview_url: '',
    file_url: '',
    price: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title" className="text-vintage-dark-brown">
          Название трека
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Введите название трека"
          required
          className="border-vintage-brown/30 focus:border-vintage-warm"
        />
      </div>

      <div>
        <Label htmlFor="duration" className="text-vintage-dark-brown">
          Длительность (секунды)
        </Label>
        <Input
          id="duration"
          type="number"
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
          placeholder="180"
          min="0"
          className="border-vintage-brown/30 focus:border-vintage-warm"
        />
      </div>

      <div>
        <Label className="text-vintage-dark-brown mb-3 block">
          Превью аудио
        </Label>
        <div className="space-y-3">
          <AudioUploader
            label="Загрузить превью"
            onUploadComplete={(url) => setFormData({ ...formData, preview_url: url })}
            accept="audio/*"
          />
          <div className="text-sm text-vintage-brown/60 text-center">или</div>
          <div>
            <Label htmlFor="preview_url" className="text-sm text-vintage-brown">
              Вставить ссылку
            </Label>
            <Input
              id="preview_url"
              value={formData.preview_url}
              onChange={(e) => setFormData({ ...formData, preview_url: e.target.value })}
              placeholder="https://example.com/preview.mp3"
              type="url"
              className="border-vintage-brown/30 focus:border-vintage-warm mt-1"
            />
          </div>
        </div>
      </div>

      <div>
        <Label className="text-vintage-dark-brown mb-3 block">
          Полный файл
        </Label>
        <div className="space-y-3">
          <AudioUploader
            label="Загрузить полный трек"
            onUploadComplete={(url) => setFormData({ ...formData, file_url: url })}
            accept="audio/*"
          />
          <div className="text-sm text-vintage-brown/60 text-center">или</div>
          <div>
            <Label htmlFor="file_url" className="text-sm text-vintage-brown">
              Вставить ссылку
            </Label>
            <Input
              id="file_url"
              value={formData.file_url}
              onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
              placeholder="https://example.com/track.mp3"
              type="url"
              className="border-vintage-brown/30 focus:border-vintage-warm mt-1"
            />
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="price" className="text-vintage-dark-brown">
          Цена (₽)
        </Label>
        <Input
          id="price"
          type="number"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
          placeholder="0"
          min="0"
          step="0.01"
          className="border-vintage-brown/30 focus:border-vintage-warm"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-vintage-warm hover:bg-vintage-brown text-vintage-cream"
        >
          {isSubmitting ? (
            <>
              <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
              Добавление...
            </>
          ) : (
            <>
              <Icon name="Plus" size={20} className="mr-2" />
              Добавить трек
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="border-vintage-brown/30 text-vintage-brown hover:bg-vintage-brown/10"
        >
          Отмена
        </Button>
      </div>
    </form>
  );
};

export default TrackForm;