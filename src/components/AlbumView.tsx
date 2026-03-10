import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from '@/components/ui/icon';
import { Album, Track } from '@/types';
import { musicApi } from '@/utils/musicApi';
import ShareButtons from '@/components/ShareButtons';

interface AlbumViewProps {
  album: Album;
  onClose: () => void;
}

const AlbumView: React.FC<AlbumViewProps> = ({
  album,
  onClose,
}) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [animatingTracks, setAnimatingTracks] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement>(null);

  const incrementPlayCount = async (trackId: string) => {
    try {
      const response = await fetch('https://functions.poehali.dev/52119c2a-82db-4422-894d-e3d5db04d16a?path=track/play', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ track_id: trackId })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ [AlbumView] Счётчик прослушиваний обновлён:', data.plays_count);
        
        setAnimatingTracks(prev => new Set(prev).add(trackId));
        setTimeout(() => {
          setAnimatingTracks(prev => {
            const next = new Set(prev);
            next.delete(trackId);
            return next;
          });
        }, 600);
      }
    } catch (error) {
      console.warn('⚠️ [AlbumView] Ошибка обновления счётчика:', error);
    }
  };

  const handlePlayTrack = async (track: Track) => {
    console.log('🔘 [AlbumView] handlePlayTrack вызван для:', track.title);

    const audio = audioRef.current;
    if (!audio) {
      console.error('❌ [AlbumView] audioRef.current пустой!');
      return;
    }

    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        try {
          await audio.play();
          setIsPlaying(true);
        } catch (error) {
          console.warn('Ошибка воспроизведения:', error);
          setIsPlaying(false);
        }
      }
    } else {
      try {
        console.log('🎵 [AlbumView] Запуск нового трека:', track.title);
        
        const audioUrl = await musicApi.getTrackFile(track.id);
        
        if (!audioUrl || audioUrl.trim() === '') {
          console.error('❌ [AlbumView] Файл трека не найден!');
          alert(`Для трека "${track.title}" не загружен аудиофайл. Загрузите файл в админ-панели.`);
          return;
        }
        
        console.log('✅ [AlbumView] Файл получен, URL:', audioUrl);
        
        const response = await fetch(audioUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch audio: ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        
        if (contentType?.includes('application/json')) {
          const data = await response.json();
          if (data.type === 'redirect' && data.url) {
            console.log('✅ [AlbumView] Получен CDN URL:', data.url);
            audio.src = data.url;
          } else {
            throw new Error('Invalid JSON response');
          }
        } else {
          const audioBlob = await response.blob();
          console.log('✅ [AlbumView] Blob создан, размер:', (audioBlob.size / 1024 / 1024).toFixed(2), 'MB');
          
          const blobUrl = URL.createObjectURL(audioBlob);
          console.log('✅ [AlbumView] Blob URL создан:', blobUrl);
          
          audio.src = blobUrl;
        }
        audio.load();
        setCurrentTrack(track);
        setCurrentTime(0);
        setDuration(0);
        
        console.log('✅ [AlbumView] Трек загружен, начинаем воспроизведение');
        await audio.play();
        setIsPlaying(true);
        
        await incrementPlayCount(track.id);
        
        console.log('✅ [AlbumView] Воспроизведение началось');
      } catch (error) {
        console.error('❌ [AlbumView] Ошибка загрузки/воспроизведения трека:', track.title, error);
        setIsPlaying(false);
      }
    }
  };

  const playNext = async () => {
    if (!currentTrack || !album.trackList) return;
    const currentIndex = album.trackList.findIndex(t => t.id === currentTrack.id);
    
    if (currentIndex < album.trackList.length - 1) {
      const nextTrack = album.trackList[currentIndex + 1];
      await handlePlayTrack(nextTrack);
    }
  };

  const playPrevious = async () => {
    if (!currentTrack || !album.trackList) return;
    const currentIndex = album.trackList.findIndex(t => t.id === currentTrack.id);
    
    if (currentIndex > 0) {
      const prevTrack = album.trackList[currentIndex - 1];
      await handlePlayTrack(prevTrack);
    }
  };

  const playAlbum = async () => {
    if (album.trackList && album.trackList.length > 0) {
      await handlePlayTrack(album.trackList[0]);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleEnded = () => {
        playNext();
      };
      
      audio.addEventListener('ended', handleEnded);
      return () => {
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [currentTrack, album.trackList]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

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
  }, []);

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="bg-vintage-cream/95 border-vintage-brown/20 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <CardContent className="p-0">
          {/* Заголовок с кнопкой закрытия */}
          <div className="flex items-center justify-between p-6 border-b border-vintage-brown/20">
            <h2 className="text-2xl font-bold text-vintage-warm">Альбом</h2>
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-vintage-warm hover:bg-vintage-brown/10"
            >
              <Icon name="X" size={24} />
            </Button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Информация об альбоме */}
            <div className="flex gap-6 mb-8">
              <div className="flex-shrink-0">
                <img
                  src={album.cover}
                  alt={album.title}
                  className="w-48 h-48 object-cover rounded-lg shadow-lg border-2 border-vintage-brown/20"
                />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-vintage-warm mb-2">{album.title}</h1>
                <div className="flex items-center gap-3 mb-4">
                  <p className="text-xl text-vintage-warm/70">{album.artist}</p>
                  {album.year && (
                    <span className="text-lg text-vintage-warm/50">• {album.year}</span>
                  )}
                </div>
                <p className="text-vintage-warm/60 mb-4">{album.description}</p>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-vintage-warm/60">{album.tracks} треков</span>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <Button
                    onClick={playAlbum}
                    className="bg-vintage-warm hover:bg-vintage-brown text-vintage-cream"
                  >
                    <Icon name="Play" size={16} className="mr-2" />
                    Слушать альбом
                  </Button>
                  <ShareButtons 
                    title={`${album.title} — ${album.artist}`}
                    description={album.description || `Слушайте альбом "${album.title}" от ${album.artist}`}
                  />
                </div>
              </div>
            </div>

            {/* Список треков */}
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-vintage-warm mb-4">Треки альбома</h3>
              {album.trackList.map((track, index) => {
                return (
                  <div
                    key={track.id}
                    className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                      currentTrack?.id === track.id
                        ? 'bg-vintage-dark-brown/20 border border-vintage-dark-brown/30'
                        : 'bg-vintage-brown/10 hover:bg-vintage-brown/15'
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-vintage-warm/60 w-8 text-center font-mono">
                        {(index + 1).toString().padStart(2, '0')}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePlayTrack(track)}
                        className="text-vintage-dark-brown hover:bg-vintage-brown/20 w-10 h-10 rounded-full"
                        title="Воспроизвести"
                      >
                        {currentTrack?.id === track.id && isPlaying ? (
                          <Icon name="Pause" size={16} />
                        ) : (
                          <Icon name="Play" size={16} />
                        )}
                      </Button>
                      <div className="flex-1">
                        <p className="font-medium text-vintage-warm">{track.title}</p>
                        <div className="flex items-center gap-3">
                          <p className="text-sm text-vintage-warm/60">{track.duration}</p>
                          <div className={`flex items-center gap-1 text-xs text-vintage-warm/60 ${
                            animatingTracks.has(track.id) ? 'play-count-animate text-vintage-warm font-bold' : ''
                          }`}>
                            <Icon name="Headphones" size={12} className={animatingTracks.has(track.id) ? 'text-vintage-warm' : ''} />
                            <span className="tabular-nums">{track.plays_count || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-vintage-warm/60">{track.duration}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Мини-плеер */}
            {currentTrack && (
              <div className="mt-8 p-4 bg-vintage-brown/10 rounded-lg border border-vintage-brown/20 space-y-3">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={playPrevious}
                    disabled={album.trackList.findIndex(t => t.id === currentTrack.id) === 0}
                    variant="ghost"
                    size="sm"
                    className="text-vintage-dark-brown hover:bg-vintage-brown/10 disabled:opacity-30"
                  >
                    <Icon name="SkipBack" size={16} />
                  </Button>
                  <Button
                    onClick={() => handlePlayTrack(currentTrack)}
                    className="bg-vintage-dark-brown hover:bg-vintage-warm text-vintage-cream w-12 h-12 rounded-full"
                  >
                    <Icon name={isPlaying ? "Pause" : "Play"} size={20} />
                  </Button>
                  <Button
                    onClick={playNext}
                    disabled={album.trackList.findIndex(t => t.id === currentTrack.id) === album.trackList.length - 1}
                    variant="ghost"
                    size="sm"
                    className="text-vintage-dark-brown hover:bg-vintage-brown/10 disabled:opacity-30"
                  >
                    <Icon name="SkipForward" size={16} />
                  </Button>
                  <div className="flex-1">
                    <p className="font-medium text-vintage-warm">{currentTrack.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-vintage-warm/60">{formatTime(currentTime)}</span>
                      <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        step="0.1"
                        value={currentTime}
                        onChange={(e) => {
                          const newTime = parseFloat(e.target.value);
                          setCurrentTime(newTime);
                          if (audioRef.current) {
                            audioRef.current.currentTime = newTime;
                          }
                        }}
                        className="flex-1 h-1 bg-vintage-brown/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-vintage-dark-brown [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-vintage-dark-brown [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, rgb(var(--vintage-dark-brown)) 0%, rgb(var(--vintage-dark-brown)) ${(currentTime / (duration || 1)) * 100}%, rgb(var(--vintage-brown) / 0.2) ${(currentTime / (duration || 1)) * 100}%, rgb(var(--vintage-brown) / 0.2) 100%)`
                        }}
                      />
                      <span className="text-sm text-vintage-warm/60">{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>

                {/* Регулятор громкости */}
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMuted(!isMuted)}
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
                    onChange={(e) => {
                      const newVolume = parseFloat(e.target.value);
                      setVolume(newVolume);
                      if (newVolume > 0 && isMuted) {
                        setIsMuted(false);
                      }
                    }}
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
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Скрытый аудио элемент - вне условия currentTrack */}
      <audio
        ref={audioRef}
        preload="metadata"
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => {
          setIsPlaying(false);
          playNext();
        }}
        onError={(e) => console.error('❌ Ошибка загрузки аудиофайла:', e)}
      />
    </div>
  );
};

export default AlbumView;