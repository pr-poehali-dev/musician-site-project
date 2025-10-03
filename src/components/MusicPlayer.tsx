import React, { useRef, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from '@/components/ui/icon';
import { Track } from '@/types';
import { getAudioFromIndexedDB } from '@/utils/audioStorage';

interface MusicPlayerProps {
  tracks: Track[];
  isPlaying: boolean;
  currentTrack: Track | null;
  currentTime: number;
  duration: number;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTrack: (track: Track) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  onTrackEnd?: () => void;
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
  setDuration,
  onTrackEnd
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume, setVolume] = React.useState(1);
  const [isMuted, setIsMuted] = React.useState(false);

  const togglePlay = () => {
    if (audioRef.current && currentTrack) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => {
          console.warn('Ошибка воспроизведения:', error);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const playNext = () => {
    const currentIndex = tracks.findIndex(track => track.id === currentTrack?.id);
    if (currentIndex < tracks.length - 1) {
      setCurrentTrack(tracks[currentIndex + 1]);
    }
  };

  const playPrevious = () => {
    const currentIndex = tracks.findIndex(track => track.id === currentTrack?.id);
    if (currentIndex > 0) {
      setCurrentTrack(tracks[currentIndex - 1]);
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
      const handleEnded = () => {
        setIsPlaying(false);
        if (onTrackEnd) {
          onTrackEnd();
        } else {
          playNext();
        }
      };
      
      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('loadedmetadata', updateDuration);
      audio.addEventListener('ended', handleEnded);
      
      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('loadedmetadata', updateDuration);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [setCurrentTime, setDuration, onTrackEnd, playNext]);

  // Обновляем громкость
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Обновляем источник аудио при смене трека
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && currentTrack?.file) {
      const loadAudio = async () => {
        try {
          let audioUrl = currentTrack.file;
          
          // Если это ID из IndexedDB, получаем blob URL
          if (audioUrl.startsWith('audio_')) {
            audioUrl = await getAudioFromIndexedDB(audioUrl);
          }
          
          audio.src = audioUrl;
          audio.load();
          setCurrentTime(0);
          setDuration(0);
          
          // Автоматически начинаем воспроизведение нового трека
          if (isPlaying) {
            audio.play().catch(error => {
              console.warn('Ошибка автовоспроизведения:', error);
              setIsPlaying(false);
            });
          }
        } catch (error) {
          console.error('Ошибка загрузки аудио:', error);
          setIsPlaying(false);
        }
      };
      
      loadAudio();
    }
  }, [currentTrack, isPlaying, setCurrentTime, setDuration]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

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
                {currentTrack?.title || 'Выберите трек'}
              </h4>
              <p className="text-vintage-warm/60">Vintage Soul</p>
            </div>

            {/* Управление воспроизведением */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={playPrevious}
                disabled={!currentTrack || tracks.findIndex(track => track.id === currentTrack?.id) === 0}
              >
                <Icon name="SkipBack" size={20} className="text-vintage-dark-brown" />
              </Button>
              <Button 
                onClick={togglePlay}
                disabled={!currentTrack}
                className="bg-vintage-dark-brown hover:bg-vintage-warm text-vintage-cream w-16 h-16 rounded-full disabled:opacity-50"
              >
                <Icon name={isPlaying ? "Pause" : "Play"} size={24} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={playNext}
                disabled={!currentTrack || tracks.findIndex(track => track.id === currentTrack?.id) === tracks.length - 1}
              >
                <Icon name="SkipForward" size={20} className="text-vintage-dark-brown" />
              </Button>
            </div>

            {/* Прогресс бар */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-vintage-warm/70">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration) || currentTrack?.duration || '0:00'}</span>
              </div>
              <div className="w-full bg-vintage-brown/20 rounded-full h-2">
                <div 
                  className="bg-vintage-dark-brown h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Регулятор громкости */}
            <div className="flex items-center gap-3 mt-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="text-vintage-dark-brown hover:bg-vintage-brown/10"
              >
                <Icon 
                  name={isMuted || volume === 0 ? "VolumeX" : volume < 0.5 ? "Volume1" : "Volume2"} 
                  size={20} 
                />
              </Button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="flex-1 h-2 bg-vintage-brown/20 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-4
                  [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-vintage-dark-brown
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-moz-range-thumb]:w-4
                  [&::-moz-range-thumb]:h-4
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-vintage-dark-brown
                  [&::-moz-range-thumb]:border-0
                  [&::-moz-range-thumb]:cursor-pointer"
                style={{
                  background: `linear-gradient(to right, rgb(var(--vintage-dark-brown)) 0%, rgb(var(--vintage-dark-brown)) ${(isMuted ? 0 : volume) * 100}%, rgb(var(--vintage-brown) / 0.2) ${(isMuted ? 0 : volume) * 100}%, rgb(var(--vintage-brown) / 0.2) 100%)`
                }}
              />
              <span className="text-sm text-vintage-warm/70 w-12 text-right">
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>

            {/* Список треков */}
            {tracks.length > 0 && (
              <div className="mt-8">
                <h5 className="text-lg font-semibold text-vintage-warm mb-4">Playlist</h5>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {tracks.map((track) => (
                    <div 
                      key={track.id}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                        currentTrack?.id === track.id
                          ? 'bg-vintage-dark-brown/10 border border-vintage-dark-brown/20' 
                          : 'hover:bg-vintage-brown/10'
                      }`}
                      onClick={() => setCurrentTrack(track)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-vintage-dark-brown rounded-full flex items-center justify-center">
                          {currentTrack?.id === track.id && isPlaying ? (
                            <Icon name="Pause" size={16} className="text-vintage-cream" />
                          ) : (
                            <Icon name="Play" size={16} className="text-vintage-cream" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-vintage-warm">{track.title}</p>
                          <p className="text-sm text-vintage-warm/60">{track.duration}</p>
                        </div>
                      </div>
                      
                      {currentTrack?.id === track.id && (
                        <div className="flex items-center space-x-1">
                          <div className="w-1 h-3 bg-vintage-warm animate-pulse rounded-full"></div>
                          <div className="w-1 h-4 bg-vintage-warm animate-pulse rounded-full" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-1 h-3 bg-vintage-warm animate-pulse rounded-full" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Скрытый аудио элемент */}
            <audio 
              ref={audioRef} 
              preload="metadata"
              onError={() => console.warn('Ошибка загрузки аудиофайла')}
            />
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default MusicPlayer;