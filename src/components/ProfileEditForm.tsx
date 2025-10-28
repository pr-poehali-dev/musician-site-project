import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

export interface ProfileFormData {
  display_name: string;
  bio: string;
  avatar_url: string;
  banner_url: string;
}

interface ProfileEditFormProps {
  initialData: ProfileFormData;
  onSubmit: (data: ProfileFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const ProfileEditForm = ({ initialData, onSubmit, onCancel, isSubmitting }: ProfileEditFormProps) => {
  const [formData, setFormData] = useState<ProfileFormData>(initialData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="display_name" className="text-vintage-dark-brown">
          Имя артиста
        </Label>
        <Input
          id="display_name"
          value={formData.display_name}
          onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
          className="bg-vintage-cream border-vintage-brown/30 text-vintage-dark-brown"
          required
        />
      </div>

      <div>
        <Label htmlFor="bio" className="text-vintage-dark-brown">
          Биография
        </Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          className="bg-vintage-cream border-vintage-brown/30 text-vintage-dark-brown min-h-[100px]"
          placeholder="Расскажите о себе..."
        />
      </div>

      <div>
        <Label htmlFor="avatar_url" className="text-vintage-dark-brown">
          URL аватара
        </Label>
        <Input
          id="avatar_url"
          type="url"
          value={formData.avatar_url}
          onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
          className="bg-vintage-cream border-vintage-brown/30 text-vintage-dark-brown"
          placeholder="https://..."
        />
        {formData.avatar_url && (
          <div className="mt-2">
            <img 
              src={formData.avatar_url} 
              alt="Превью аватара" 
              className="w-24 h-24 rounded-full object-cover border-2 border-vintage-brown/30"
            />
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="banner_url" className="text-vintage-dark-brown">
          URL баннера
        </Label>
        <Input
          id="banner_url"
          type="url"
          value={formData.banner_url}
          onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })}
          className="bg-vintage-cream border-vintage-brown/30 text-vintage-dark-brown"
          placeholder="https://..."
        />
        {formData.banner_url && (
          <div className="mt-2">
            <img 
              src={formData.banner_url} 
              alt="Превью баннера" 
              className="w-full h-32 object-cover rounded-lg border-2 border-vintage-brown/30"
            />
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="border-vintage-brown/30 text-vintage-brown hover:bg-vintage-brown/10"
        >
          <Icon name="X" size={16} className="mr-2" />
          Отмена
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-vintage-warm hover:bg-vintage-warm/90 text-vintage-cream"
        >
          <Icon name="Check" size={16} className="mr-2" />
          {isSubmitting ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </div>
    </form>
  );
};

export default ProfileEditForm;
