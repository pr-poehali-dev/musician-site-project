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
  initialData?: TrackFormData;
  isEditing?: boolean;
}

export interface TrackFormData {
  title: string;
  album_id: number;
  duration: number;
  preview_url: string;
  file_url: string;
  price: number;
}

const TrackForm = ({ onSubmit, onCancel, albumId, initialData, isEditing = false }: TrackFormProps) => {
  const [formData, setFormData] = useState<TrackFormData>(
    initialData || {
      title: '',
      album_id: albumId,
      duration: 0,
      preview_url: '',
      file_url: '',
      price: 0,
    }
  );
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
          Длительность {formData.duration > 0 && (
            <span className="text-vintage-brown font-normal">
              ({Math.floor(formData.duration / 60)}:{(formData.duration % 60).toString().padStart(2, '0')})
            </span>
          )}
        </Label>
        <Input
          id="duration"
          type="number"
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
          placeholder="Определится автоматически"
          min="0"
          className="border-vintage-brown/30 focus:border-vintage-warm"
        />
        {formData.duration > 0 && (
          <p className="text-xs text-green-600 mt-1 flex items-center">
            <Icon name="CheckCircle" size={12} className="mr-1" />
            Длительность определена автоматически
          </p>
        )}
      </div>

      <div>
        <Label className="text-vintage-dark-brown mb-3 block">
          Превью аудио
        </Label>
        <div className="space-y-3">
          <AudioUploader
            label="Загрузить превью"
            onUploadComplete={(url, duration) => {
              const updates: Partial<TrackFormData> = { preview_url: url };
              if (duration && formData.duration === 0) {
                updates.duration = duration;
              }
              setFormData({ ...formData, ...updates });
            }}
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
        {formData.preview_url && (
          <div className="mt-3 p-4 bg-vintage-brown/5 rounded-lg border border-vintage-brown/20">
            <div className="flex items-center gap-3 mb-2">
              <Icon name="Play" size={16} className="text-vintage-warm" />
              <span className="text-sm font-medium text-vintage-dark-brown">Предпросмотр превью</span>
            </div>
            <audio 
              src={formData.preview_url} 
              controls 
              className="w-full"
              style={{ height: '40px' }}
            />
          </div>
        )}
      </div>

      <div>
        <Label className="text-vintage-dark-brown mb-3 block">
          Полный файл
        </Label>
        <div className="space-y-3">
          <AudioUploader
            label="Загрузить полный трек"
            onUploadComplete={(url, duration) => {
              const updates: Partial<TrackFormData> = { file_url: url };
              if (duration && formData.duration === 0) {
                updates.duration = duration;
              }
              setFormData({ ...formData, ...updates });
            }}
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
        {formData.file_url && (
          <div className="mt-3 p-4 bg-vintage-brown/5 rounded-lg border border-vintage-brown/20">
            <div className="flex items-center gap-3 mb-2">
              <Icon name="Music" size={16} className="text-vintage-warm" />
              <span className="text-sm font-medium text-vintage-dark-brown">Предпросмотр полного трека</span>
            </div>
            <audio 
              src={formData.file_url} 
              controls 
              className="w-full"
              style={{ height: '40px' }}
            />
          </div>
        )}
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
              <Icon name={isEditing ? "Save" : "Plus"} size={20} className="mr-2" />
              {isEditing ? 'Сохранить' : 'Добавить трек'}
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