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
  const playerRef = useRef<HTMLDivElement>(null);
  const [volume, setVolume] = React.useState(1);
  const [isMuted, setIsMuted] = React.useState(false);
  const [showTooltip, setShowTooltip] = React.useState(false);
  const [tooltipPosition, setTooltipPosition] = React.useState(0);
  const [tooltipTime, setTooltipTime] = React.useState(0);
  const [position, setPosition] = React.useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = React.useState(false);

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

  const handleMouseDown = (e: React.MouseEvent) => {
    if (playerRef.current && !isMinimized) {
      const rect = playerRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && playerRef.current) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      const maxX = window.innerWidth - playerRef.current.offsetWidth;
      const maxY = window.innerHeight - playerRef.current.offsetHeight;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const isPlayerActive = currentTrack && isPlaying;

  return (
    <>
      {/* Перемещаемый плеер */}
      {isPlayerActive && (
        <div 
          ref={playerRef}
          className="fixed z-50 bg-vintage-dark-brown/98 backdrop-blur-lg rounded-2xl shadow-2xl border-2 border-vintage-warm/30 transition-all"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            width: isMinimized ? '300px' : '400px',
            cursor: isDragging ? 'grabbing' : 'default'
          }}
        >
          {/* Заголовок с возможностью перетаскивания */}
          <div 
            className="px-4 py-3 bg-vintage-warm/20 rounded-t-2xl cursor-grab active:cursor-grabbing flex items-center justify-between border-b border-vintage-warm/20"
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center gap-2">
              <Icon name="Music" size={18} className="text-vintage-cream" />
              <span className="text-vintage-cream font-semibold text-sm">Music Player</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-vintage-cream hover:bg-vintage-warm/20 h-7 w-7 p-0"
              >
                <Icon name={isMinimized ? "Maximize2" : "Minimize2"} size={14} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsPlaying(false);
                  if (audioRef.current) {
                    audioRef.current.pause();
                  }
                }}
                className="text-vintage-cream hover:bg-vintage-warm/20 h-7 w-7 p-0"
              >
                <Icon name="X" size={14} />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <div className="p-5 space-y-4">
              {/* Обложка и название */}
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-vintage-brown via-vintage-warm to-vintage-cream flex items-center justify-center shadow-lg flex-shrink-0">
                  <Icon name="Music" size={32} className="text-vintage-dark-brown" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-vintage-cream font-semibold truncate">{currentTrack?.title}</h4>
                  <p className="text-vintage-cream/60 text-sm">Vintage Soul</p>
                </div>
              </div>

              {/* Прогресс бар */}
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    onChange={(e) => {
                      const newTime = parseFloat(e.target.value);
                      setCurrentTime(newTime);
                      if (audioRef.current) {
                        audioRef.current.currentTime = newTime;
                      }
                    }}
                    className="w-full h-2 bg-vintage-warm/20 rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:w-4
                      [&::-webkit-slider-thumb]:h-4
                      [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:bg-vintage-cream
                      [&::-webkit-slider-thumb]:cursor-pointer
                      [&::-webkit-slider-thumb]:shadow-lg
                      [&::-webkit-slider-thumb]:hover:scale-110
                      [&::-webkit-slider-thumb]:transition-transform
                      [&::-moz-range-thumb]:w-4
                      [&::-moz-range-thumb]:h-4
                      [&::-moz-range-thumb]:rounded-full
                      [&::-moz-range-thumb]:bg-vintage-cream
                      [&::-moz-range-thumb]:border-0
                      [&::-moz-range-thumb]:cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, rgb(245 237 224) 0%, rgb(245 237 224) ${(currentTime / (duration || 1)) * 100}%, rgb(194 146 110 / 0.2) ${(currentTime / (duration || 1)) * 100}%, rgb(194 146 110 / 0.2) 100%)`
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-vintage-cream/70">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Управление */}
              <div className="flex items-center justify-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={playPrevious}
                  disabled={tracks.findIndex(track => track.id === currentTrack?.id) === 0}
                  className="text-vintage-cream hover:bg-vintage-warm/20"
                >
                  <Icon name="SkipBack" size={22} />
                </Button>
                <Button 
                  onClick={togglePlay}
                  className="bg-vintage-warm hover:bg-vintage-cream text-vintage-dark-brown w-14 h-14 rounded-full shadow-lg"
                >
                  <Icon name={isPlaying ? "Pause" : "Play"} size={24} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={playNext}
                  disabled={tracks.findIndex(track => track.id === currentTrack?.id) === tracks.length - 1}
                  className="text-vintage-cream hover:bg-vintage-warm/20"
                >
                  <Icon name="SkipForward" size={22} />
                </Button>
              </div>

              {/* Громкость */}
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="text-vintage-cream hover:bg-vintage-warm/20"
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
                  className="flex-1 h-2 bg-vintage-warm/20 rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-3
                    [&::-webkit-slider-thumb]:h-3
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-vintage-cream
                    [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-moz-range-thumb]:w-3
                    [&::-moz-range-thumb]:h-3
                    [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-vintage-cream
                    [&::-moz-range-thumb]:border-0
                    [&::-moz-range-thumb]:cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, rgb(245 237 224) 0%, rgb(245 237 224) ${(isMuted ? 0 : volume) * 100}%, rgb(194 146 110 / 0.2) ${(isMuted ? 0 : volume) * 100}%, rgb(194 146 110 / 0.2) 100%)`
                  }}
                />
                <span className="text-xs text-vintage-cream/70 w-10 text-right">
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </span>
              </div>
            </div>
          )}

          {/* Минимизированный вид */}
          {isMinimized && (
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-vintage-brown to-vintage-warm flex items-center justify-center flex-shrink-0">
                  <Icon name="Music" size={20} className="text-vintage-cream" />
                </div>
                <span className="text-vintage-cream text-sm truncate">{currentTrack?.title}</span>
              </div>
              <Button 
                onClick={togglePlay}
                size="sm"
                className="bg-vintage-warm hover:bg-vintage-cream text-vintage-dark-brown w-10 h-10 rounded-full flex-shrink-0"
              >
                <Icon name={isPlaying ? "Pause" : "Play"} size={16} />
              </Button>
            </div>
          )}

          {/* Скрытый аудио элемент */}
          <audio 
            ref={audioRef} 
            preload="metadata"
            onError={() => console.warn('Ошибка загрузки аудиофайла')}
          />
        </div>
      )}

      {/* Основная секция */}
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
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => {
                    const newTime = parseFloat(e.target.value);
                    setCurrentTime(newTime);
                    if (audioRef.current) {
                      audioRef.current.currentTime = newTime;
                    }
                  }}
                  onMouseMove={(e) => {
                    if (!currentTrack) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const percent = (e.clientX - rect.left) / rect.width;
                    const time = percent * (duration || 0);
                    setTooltipTime(time);
                    setTooltipPosition(e.clientX - rect.left);
                    setShowTooltip(true);
                  }}
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  disabled={!currentTrack}
                  className="w-full h-2 bg-vintage-brown/20 rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-4
                    [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-vintage-dark-brown
                    [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-webkit-slider-thumb]:shadow-lg
                    [&::-webkit-slider-thumb]:hover:scale-110
                    [&::-webkit-slider-thumb]:transition-transform
                    [&::-moz-range-thumb]:w-4
                    [&::-moz-range-thumb]:h-4
                    [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-vintage-dark-brown
                    [&::-moz-range-thumb]:border-0
                    [&::-moz-range-thumb]:cursor-pointer
                    [&::-moz-range-thumb]:shadow-lg
                    [&::-moz-range-thumb]:hover:scale-110
                    [&::-moz-range-thumb]:transition-transform"
                  style={{
                    background: `linear-gradient(to right, rgb(139 101 82) 0%, rgb(139 101 82) ${(currentTime / (duration || 1)) * 100}%, rgb(139 101 82 / 0.2) ${(currentTime / (duration || 1)) * 100}%, rgb(139 101 82 / 0.2) 100%)`
                  }}
                />
                {showTooltip && currentTrack && (
                  <div 
                    className="absolute -top-10 transform -translate-x-1/2 bg-vintage-dark-brown text-vintage-cream text-xs px-2 py-1 rounded shadow-lg pointer-events-none"
                    style={{ left: `${tooltipPosition}px` }}
                  >
                    {formatTime(tooltipTime)}
                  </div>
                )}
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
          </CardContent>
        </Card>
      </div>
    </section>
    </>
  );
};

export default MusicPlayer;