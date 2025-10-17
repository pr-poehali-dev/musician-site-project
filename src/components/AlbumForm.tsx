import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface AlbumFormProps {
  onSubmit: (albumData: AlbumFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: AlbumFormData;
  isEditing?: boolean;
}

export interface AlbumFormData {
  title: string;
  description: string;
  price: number;
  cover_url: string;
}

const AlbumForm = ({ onSubmit, onCancel, initialData, isEditing = false }: AlbumFormProps) => {
  const [formData, setFormData] = useState<AlbumFormData>(
    initialData || {
      title: '',
      description: '',
      price: 0,
      cover_url: '',
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
          Название альбома
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Введите название альбома"
          required
          className="border-vintage-brown/30 focus:border-vintage-warm"
        />
      </div>

      <div>
        <Label htmlFor="description" className="text-vintage-dark-brown">
          Описание
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Расскажите об альбоме..."
          className="border-vintage-brown/30 focus:border-vintage-warm min-h-[100px]"
        />
      </div>

      <div>
        <Label htmlFor="cover_url" className="text-vintage-dark-brown">
          Обложка (URL)
        </Label>
        <Input
          id="cover_url"
          value={formData.cover_url}
          onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
          placeholder="https://example.com/cover.jpg"
          type="url"
          className="border-vintage-brown/30 focus:border-vintage-warm"
        />
        {formData.cover_url && (
          <div className="mt-3">
            <img
              src={formData.cover_url}
              alt="Предпросмотр обложки"
              className="w-32 h-32 object-cover rounded-lg border-2 border-vintage-brown/20"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
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
          required
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
              Сохранение...
            </>
          ) : (
            <>
              <Icon name={isEditing ? 'Save' : 'Plus'} size={20} className="mr-2" />
              {isEditing ? 'Сохранить' : 'Создать альбом'}
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

export default AlbumForm;
