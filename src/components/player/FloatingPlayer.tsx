import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import Icon from '@/components/ui/icon';
import { Track } from '@/types';

interface FloatingPlayerProps {
  playerRef: React.RefObject<HTMLDivElement>;
  position: { x: number; y: number };
  isMinimized: boolean;
  isDragging: boolean;
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  tracks: Track[];
  audioRef: React.RefObject<HTMLAudioElement>;
  formatTime: (time: number) => string;
  handleMouseDown: (e: React.MouseEvent) => void;
  setIsMinimized: (value: boolean) => void;
  setIsPlaying: (value: boolean) => void;
  setCurrentTime: (value: number) => void;
  togglePlay: () => void;
  playPrevious: () => void;
  playNext: () => void;
  toggleMute: () => void;
  handleVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FloatingPlayer: React.FC<FloatingPlayerProps> = ({
  playerRef,
  position,
  isMinimized,
  isDragging,
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  tracks,
  audioRef,
  formatTime,
  handleMouseDown,
  setIsMinimized,
  setIsPlaying,
  setCurrentTime,
  togglePlay,
  playPrevious,
  playNext,
  toggleMute,
  handleVolumeChange,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div 
      ref={playerRef}
      className={`fixed z-50 bg-vintage-dark-brown/98 backdrop-blur-lg rounded-2xl shadow-2xl border-2 border-vintage-warm/30 transition-all duration-300 ease-out ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: isMinimized ? '300px' : '400px',
        cursor: isDragging ? 'grabbing' : 'default',
        transform: `scale(${isVisible ? 1 : 0.95})`,
        transformOrigin: 'center'
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
            <div className="relative group">
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
                  [&::-webkit-slider-thumb]:cursor-grab
                  [&::-webkit-slider-thumb]:active:cursor-grabbing
                  [&::-webkit-slider-thumb]:shadow-lg
                  [&::-webkit-slider-thumb]:hover:scale-125
                  [&::-webkit-slider-thumb]:active:scale-110
                  [&::-webkit-slider-thumb]:transition-all
                  [&::-webkit-slider-thumb]:duration-150
                  [&::-moz-range-thumb]:w-4
                  [&::-moz-range-thumb]:h-4
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-vintage-cream
                  [&::-moz-range-thumb]:border-0
                  [&::-moz-range-thumb]:cursor-grab
                  [&::-moz-range-thumb]:active:cursor-grabbing
                  hover:h-3
                  active:h-3
                  transition-all"
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
  );
};

export default FloatingPlayer;