import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';

interface Track {
  id: number;
  title: string;
  duration: number;
  preview_url?: string;
  price: number;
  album_id: number;
  label?: string;
  genre?: string;
  plays_count?: number;
}

interface AudioPlayerProps {
  track: Track;
  onClose: () => void;
}

const AudioPlayer = ({ track, onClose }: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(100);

  useEffect(() => {
    if (audioRef.current && track.preview_url) {
      audioRef.current.src = track.preview_url;
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [track]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="fixed bottom-6 left-6 right-6 max-w-4xl mx-auto bg-vintage-cream/95 backdrop-blur-sm border-vintage-warm/50 shadow-2xl z-50">
      <div className="p-6">
        <audio ref={audioRef} />
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-vintage-dark-brown text-lg truncate">
              {track.title}
            </h3>
            {track.label && (
              <p className="text-sm text-vintage-brown">{track.label}</p>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-vintage-brown hover:text-vintage-dark-brown"
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-vintage-brown font-mono w-12">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              max={track.duration}
              step={0.1}
              onValueChange={handleSeek}
              className="flex-1"
            />
            <span className="text-sm text-vintage-brown font-mono w-12 text-right">
              {formatTime(track.duration)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <Icon name="Volume2" size={20} className="text-vintage-brown" />
              <Slider
                value={[volume]}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                className="w-32"
              />
            </div>

            <Button
              size="lg"
              onClick={togglePlayPause}
              className="bg-vintage-warm hover:bg-vintage-brown text-vintage-cream w-16 h-16 rounded-full"
            >
              <Icon name={isPlaying ? "Pause" : "Play"} size={24} />
            </Button>

            <div className="flex-1" />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AudioPlayer;
