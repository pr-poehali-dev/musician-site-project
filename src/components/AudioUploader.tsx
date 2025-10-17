import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface AudioUploaderProps {
  onUploadComplete: (url: string, duration?: number) => void;
  label?: string;
  accept?: string;
}

const AudioUploader = ({ onUploadComplete, label = 'Аудиофайл', accept = 'audio/*' }: AudioUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      const url = URL.createObjectURL(file);
      
      audio.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(url);
        resolve(Math.round(audio.duration));
      });
      
      audio.addEventListener('error', () => {
        URL.revokeObjectURL(url);
        resolve(0);
      });
      
      audio.src = url;
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/') && !file.type.startsWith('image/')) {
      toast({
        title: 'Неверный формат',
        description: 'Пожалуйста, выберите аудио или изображение',
        variant: 'destructive',
      });
      return;
    }

    setFileName(file.name);
    setUploading(true);

    try {
      let audioDuration = 0;
      if (file.type.startsWith('audio/')) {
        audioDuration = await getAudioDuration(file);
        if (audioDuration > 0) {
          toast({
            title: 'Длительность определена',
            description: `${Math.floor(audioDuration / 60)}:${(audioDuration % 60).toString().padStart(2, '0')}`,
          });
        }
      }

      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];

        const response = await fetch('https://functions.poehali.dev/file-upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            file: base64,
            filename: file.name,
            contentType: file.type,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          onUploadComplete(data.url, audioDuration > 0 ? audioDuration : undefined);
          toast({
            title: 'Файл загружен!',
            description: `${file.name} успешно загружен`,
          });
        } else {
          const error = await response.json();
          toast({
            title: 'Ошибка загрузки',
            description: error.message || 'Не удалось загрузить файл',
            variant: 'destructive',
          });
        }
        setUploading(false);
      };

      reader.onerror = () => {
        toast({
          title: 'Ошибка',
          description: 'Не удалось прочитать файл',
          variant: 'destructive',
        });
        setUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при загрузке файла',
        variant: 'destructive',
      });
      setUploading(false);
    }
  };

  return (
    <div>
      <Label className="text-vintage-dark-brown">{label}</Label>
      <div className="flex gap-2 mt-2">
        <Input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex-1 border-vintage-brown/30 text-vintage-brown hover:bg-vintage-brown/10"
        >
          {uploading ? (
            <>
              <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
              Загрузка...
            </>
          ) : (
            <>
              <Icon name="Upload" size={16} className="mr-2" />
              Выбрать файл
            </>
          )}
        </Button>
      </div>
      {fileName && !uploading && (
        <p className="text-sm text-vintage-brown mt-2 flex items-center">
          <Icon name="CheckCircle" size={14} className="mr-1 text-green-600" />
          {fileName}
        </p>
      )}
    </div>
  );
};

export default AudioUploader;