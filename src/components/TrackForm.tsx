import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { convertYandexDiskUrl } from '@/utils/yandexDisk';

const MUSIC_GENRES = [
  'Поп',
  'Рок',
  'Хип-хоп',
  'Рэп',
  'Электронная',
  'Джаз',
  'Блюз',
  'R&B',
  'Кантри',
  'Регги',
  'Классическая',
  'Метал',
  'Панк',
  'Фолк',
  'Инди',
  'Диско',
  'Фанк',
  'Соул',
  'Техно',
  'Хаус',
  'Транс',
  'Дабстеп',
  'Драм-н-бейс',
  'Ambient',
  'Шансон',
  'Другое',
];

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
  label?: string;
  genre?: string;
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
      label: '',
      genre: '',
    }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string>('');
  const [fullAudioUrl, setFullAudioUrl] = useState<string>('');
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingFull, setLoadingFull] = useState(false);

  useEffect(() => {
    const loadPreviewUrl = async () => {
      if (formData.preview_url) {
        setLoadingPreview(true);
        try {
          const url = await convertYandexDiskUrl(formData.preview_url);
          setPreviewAudioUrl(url);
        } catch (error) {
          console.error('Ошибка загрузки превью:', error);
          setPreviewAudioUrl(formData.preview_url);
        } finally {
          setLoadingPreview(false);
        }
      } else {
        setPreviewAudioUrl('');
      }
    };
    loadPreviewUrl();
  }, [formData.preview_url]);

  useEffect(() => {
    const loadFullUrl = async () => {
      if (formData.file_url) {
        setLoadingFull(true);
        try {
          const url = await convertYandexDiskUrl(formData.file_url);
          setFullAudioUrl(url);
        } catch (error) {
          console.error('Ошибка загрузки полного трека:', error);
          setFullAudioUrl(formData.file_url);
        } finally {
          setLoadingFull(false);
        }
      } else {
        setFullAudioUrl('');
      }
    };
    loadFullUrl();
  }, [formData.file_url]);

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
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Icon name="Info" size={20} className="text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-blue-900 font-medium mb-2">Загрузите трек на Яндекс.Диск</p>
                <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Загрузите аудио на <a href="https://disk.yandex.ru" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">Яндекс.Диск</a></li>
                  <li>Нажмите "Поделиться" → "Скопировать публичную ссылку"</li>
                  <li>Вставьте ссылку в поле ниже</li>
                </ol>
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="preview_url" className="text-sm text-vintage-brown">
              Ссылка с Яндекс.Диска
            </Label>
            <Input
              id="preview_url"
              value={formData.preview_url}
              onChange={(e) => setFormData({ ...formData, preview_url: e.target.value })}
              placeholder="https://disk.yandex.ru/d/..."
              type="url"
              className="border-vintage-brown/30 focus:border-vintage-warm mt-1"
            />
          </div>
        </div>
        {formData.preview_url && (
          <div className="mt-3 p-4 bg-vintage-brown/5 rounded-lg border border-vintage-brown/20">
            <div className="flex items-center gap-3 mb-2">
              {loadingPreview ? (
                <Icon name="Loader2" size={16} className="text-vintage-warm animate-spin" />
              ) : (
                <Icon name="Play" size={16} className="text-vintage-warm" />
              )}
              <span className="text-sm font-medium text-vintage-dark-brown">
                {loadingPreview ? 'Загрузка превью...' : 'Предпросмотр превью'}
              </span>
            </div>
            {previewAudioUrl && !loadingPreview && (
              <audio 
                src={previewAudioUrl} 
                controls 
                className="w-full"
                style={{ height: '40px' }}
                onError={(e) => {
                  console.error('Ошибка воспроизведения превью');
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            {!loadingPreview && !previewAudioUrl && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <Icon name="AlertCircle" size={12} />
                Не удалось загрузить превью. Проверьте ссылку.
              </p>
            )}
          </div>
        )}
      </div>

      <div>
        <Label className="text-vintage-dark-brown mb-3 block">
          Полный файл
        </Label>
        <div className="space-y-3">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Icon name="Info" size={20} className="text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-blue-900 font-medium mb-2">Загрузите полный трек на Яндекс.Диск</p>
                <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Загрузите аудио на <a href="https://disk.yandex.ru" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">Яндекс.Диск</a></li>
                  <li>Нажмите "Поделиться" → "Скопировать публичную ссылку"</li>
                  <li>Вставьте ссылку в поле ниже</li>
                </ol>
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="file_url" className="text-sm text-vintage-brown">
              Ссылка с Яндекс.Диска
            </Label>
            <Input
              id="file_url"
              value={formData.file_url}
              onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
              placeholder="https://disk.yandex.ru/d/..."
              type="url"
              className="border-vintage-brown/30 focus:border-vintage-warm mt-1"
            />
          </div>
        </div>
        {formData.file_url && (
          <div className="mt-3 p-4 bg-vintage-brown/5 rounded-lg border border-vintage-brown/20">
            <div className="flex items-center gap-3 mb-2">
              {loadingFull ? (
                <Icon name="Loader2" size={16} className="text-vintage-warm animate-spin" />
              ) : (
                <Icon name="Music" size={16} className="text-vintage-warm" />
              )}
              <span className="text-sm font-medium text-vintage-dark-brown">
                {loadingFull ? 'Загрузка трека...' : 'Предпросмотр полного трека'}
              </span>
            </div>
            {fullAudioUrl && !loadingFull && (
              <audio 
                src={fullAudioUrl} 
                controls 
                className="w-full"
                style={{ height: '40px' }}
                onError={(e) => {
                  console.error('Ошибка воспроизведения полного трека');
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            {!loadingFull && !fullAudioUrl && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <Icon name="AlertCircle" size={12} />
                Не удалось загрузить трек. Проверьте ссылку.
              </p>
            )}
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="label" className="text-vintage-dark-brown">
          Лейбл
        </Label>
        <Input
          id="label"
          value={formData.label || ''}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
          placeholder="Например: Universal Music, Sony Music"
          className="border-vintage-brown/30 focus:border-vintage-warm"
        />
        <p className="text-xs text-vintage-brown/60 mt-1">
          Необязательное поле
        </p>
      </div>

      <div>
        <Label htmlFor="genre" className="text-vintage-dark-brown">
          Стиль музыки
        </Label>
        <Select
          value={formData.genre || ''}
          onValueChange={(value) => setFormData({ ...formData, genre: value })}
        >
          <SelectTrigger className="border-vintage-brown/30 focus:border-vintage-warm">
            <SelectValue placeholder="Выберите стиль музыки" />
          </SelectTrigger>
          <SelectContent>
            {MUSIC_GENRES.map((genre) => (
              <SelectItem key={genre} value={genre}>
                {genre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-vintage-brown/60 mt-1">
          Необязательное поле
        </p>
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