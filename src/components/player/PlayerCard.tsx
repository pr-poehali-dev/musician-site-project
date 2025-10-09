import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from '@/components/ui/icon';
import { Track } from '@/types';

interface PlayerCardProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  showTooltip: boolean;
  tooltipPosition: number;
  tooltipTime: number;
  tracks: Track[];
  currentAlbumTracks?: Track[];
  audioRef: React.RefObject<HTMLAudioElement>;
  formatTime: (time: number) => string;
  togglePlay: () => void;
  playPrevious: () => void;
  playNext: () => void;
  playAlbum?: () => void;
  setCurrentTime: (value: number) => void;
  setTooltipTime: (value: number) => void;
  setTooltipPosition: (value: number) => void;
  setShowTooltip: (value: boolean) => void;
  toggleMute: () => void;
  handleVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setCurrentTrack: (track: Track) => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  showTooltip,
  tooltipPosition,
  tooltipTime,
  tracks,
  currentAlbumTracks,
  audioRef,
  formatTime,
  togglePlay,
  playPrevious,
  playNext,
  playAlbum,
  setCurrentTime,
  setTooltipTime,
  setTooltipPosition,
  setShowTooltip,
  toggleMute,
  handleVolumeChange,
  setCurrentTrack,
}) => {
  const activeTracks = currentAlbumTracks || tracks;
  const currentIndex = activeTracks.findIndex(track => track.id === currentTrack?.id);
  const isFirstTrack = currentIndex === 0;
  const isLastTrack = currentIndex === activeTracks.length - 1;
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
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={playPrevious}
                  disabled={!currentTrack || isFirstTrack}
                  className="text-vintage-dark-brown hover:bg-vintage-brown/10 disabled:opacity-30"
                >
                  <Icon name="SkipBack" size={20} />
                </Button>
                <Button 
                  onClick={togglePlay}
                  disabled={!currentTrack}
                  className="bg-vintage-dark-brown hover:bg-vintage-warm text-vintage-cream w-16 h-16 rounded-full disabled:opacity-50 transition-all hover:scale-105"
                >
                  <Icon name={isPlaying ? "Pause" : "Play"} size={24} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={playNext}
                  disabled={!currentTrack || isLastTrack}
                  className="text-vintage-dark-brown hover:bg-vintage-brown/10 disabled:opacity-30"
                >
                  <Icon name="SkipForward" size={20} />
                </Button>
              </div>
              
              {currentAlbumTracks && currentAlbumTracks.length > 0 && playAlbum && (
                <div className="flex justify-center">
                  <Button 
                    onClick={playAlbum}
                    variant="outline"
                    size="sm"
                    className="border-vintage-dark-brown text-vintage-dark-brown hover:bg-vintage-dark-brown hover:text-vintage-cream"
                  >
                    <Icon name="ListMusic" size={16} className="mr-2" />
                    Воспроизвести весь альбом ({currentAlbumTracks.length} треков)
                  </Button>
                </div>
              )}
            </div>

            {/* Прогресс бар */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-vintage-warm/70">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration) || currentTrack?.duration || '0:00'}</span>
              </div>
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
                    [&::-moz-range-thumb]:bg-vintage-dark-brown
                    [&::-moz-range-thumb]:border-0
                    [&::-moz-range-thumb]:cursor-grab
                    [&::-moz-range-thumb]:active:cursor-grabbing
                    [&::-moz-range-thumb]:shadow-lg
                    [&::-moz-range-thumb]:hover:scale-125
                    [&::-moz-range-thumb]:active:scale-110
                    [&::-moz-range-thumb]:transition-all
                    [&::-moz-range-thumb]:duration-150
                    hover:h-3
                    active:h-3
                    transition-all"
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
  );
};

export default PlayerCard;