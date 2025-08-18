import React, { useRef, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from '@/components/ui/icon';
import { Track } from '@/types';

interface MusicPlayerProps {
  tracks: Track[];
  isPlaying: boolean;
  currentTrack: number;
  currentTime: number;
  duration: number;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTrack: (track: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({
  tracks,
  isPlaying,
  currentTrack,
  currentTime,
  duration,
  setIsPlaying,
  setCurrentTrack,
  setCurrentTime,
  setDuration
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const updateTime = () => setCurrentTime(audio.currentTime);
      const updateDuration = () => setDuration(audio.duration);
      
      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('loadedmetadata', updateDuration);
      
      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('loadedmetadata', updateDuration);
      };
    }
  }, [setCurrentTime, setDuration]);

  return (
    <section id="music" className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-bold text-vintage-warm mb-4">Музыка</h3>
          <p className="text-vintage-warm/70 text-lg">Окунись в атмосферу винтажной музыки</p>
        </div>

        <Card className="bg-vintage-cream/95 backdrop-blur-sm border-vintage-brown/20 shadow-2xl">
          <CardContent className="p-8">
            {/* Текущий трек */}
            <div className="text-center mb-8">
              <div className="w-48 h-48 mx-auto mb-6 rounded-full bg-gradient-to-br from-vintage-brown via-vintage-dark-brown to-vintage-warm flex items-center justify-center shadow-xl">
                <Icon name="Music" size={64} className="text-vintage-cream" />
              </div>
              <h4 className="text-2xl font-bold text-vintage-warm mb-2">
                {tracks[currentTrack]?.title || 'Выберите трек'}
              </h4>
              <p className="text-vintage-warm/60">Vintage Soul</p>
            </div>

            {/* Управление воспроизведением */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <Button variant="ghost" size="sm">
                <Icon name="SkipBack" size={20} className="text-vintage-dark-brown" />
              </Button>
              <Button 
                onClick={togglePlay}
                className="bg-vintage-dark-brown hover:bg-vintage-warm text-vintage-cream w-16 h-16 rounded-full"
              >
                <Icon name={isPlaying ? "Pause" : "Play"} size={24} />
              </Button>
              <Button variant="ghost" size="sm">
                <Icon name="SkipForward" size={20} className="text-vintage-dark-brown" />
              </Button>
            </div>

            {/* Прогресс бар */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-vintage-warm/70">
                <span>{formatTime(currentTime)}</span>
                <span>{tracks[currentTrack]?.duration || '0:00'}</span>
              </div>
              <div className="w-full bg-vintage-brown/20 rounded-full h-2">
                <div 
                  className="bg-vintage-dark-brown h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Список треков */}
            <div className="space-y-3">
              {tracks.map((track, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                    currentTrack === index 
                      ? 'bg-vintage-dark-brown/10 border border-vintage-dark-brown/20' 
                      : 'hover:bg-vintage-brown/10'
                  }`}
                  onClick={() => setCurrentTrack(index)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-vintage-dark-brown rounded-full flex items-center justify-center">
                      <Icon name="Music" size={16} className="text-vintage-cream" />
                    </div>
                    <div>
                      <p className="font-medium text-vintage-warm">{track.title}</p>
                      <p className="text-sm text-vintage-warm/60">{track.duration}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Icon name="Play" size={16} className="text-vintage-dark-brown" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Скрытый аудио элемент */}
            <audio ref={audioRef} />
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default MusicPlayer;