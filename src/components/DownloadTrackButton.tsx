import React from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Track } from '@/types';
import { incrementDownloads } from '@/utils/trackStats';
import { getAudioFromIndexedDB } from '@/utils/audioStorage';

interface DownloadTrackButtonProps {
  track: Track;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const DownloadTrackButton: React.FC<DownloadTrackButtonProps> = ({
  track,
  variant = 'outline',
  size = 'sm',
  className = ''
}) => {
  const handleDownload = async () => {
    try {
      let audioUrl = track.file;
      
      if (audioUrl.startsWith('audio_')) {
        audioUrl = await getAudioFromIndexedDB(audioUrl);
      }
      
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${track.title}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      incrementDownloads(track.id);
      
      console.log(`✅ Трек "${track.title}" скачан`);
    } catch (error) {
      console.error('❌ Ошибка скачивания трека:', error);
      alert('Не удалось скачать трек. Попробуйте еще раз.');
    }
  };

  return (
    <Button
      onClick={handleDownload}
      variant={variant}
      size={size}
      className={className}
      title={`Скачать "${track.title}"`}
    >
      <Icon name="Download" size={16} />
    </Button>
  );
};

export default DownloadTrackButton;
