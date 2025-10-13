import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from '@/components/ui/icon';
import { Album, Track } from '@/types';
import { getAudioFromIndexedDB } from '@/utils/audioStorage';

interface AlbumViewProps {
  album: Album;
  onClose: () => void;
  onAddToCart: (item: { id: string; title: string; type: 'track' | 'album'; price: number; quantity: number }) => void;
}

const AlbumView: React.FC<AlbumViewProps> = ({
  album,
  onClose,
  onAddToCart
}) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayTrack = (track: Track) => {
    if (!track.file || track.file.trim() === '') {
      console.warn('⚠️ Трек не имеет аудиофайла:', track.title);
      alert(`Для трека "${track.title}" не загружен аудиофайл. Загрузите файл в админ-панели.`);
      return;
    }

    if (currentTrack?.id === track.id) {
      const audio = audioRef.current;
      if (audio) {
        if (isPlaying) {
          audio.pause();
        } else {
          audio.play().catch(error => console.warn('Ошибка воспроизведения:', error));
        }
      }
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
      setCurrentTime(0);
    }
  };

  const playNext = () => {
    if (!currentTrack || !album.trackList) return;
    const currentIndex = album.trackList.findIndex(t => t.id === currentTrack.id);
    const playableTracks = album.trackList.filter(t => t.file && t.file.trim() !== '');
    const nextPlayableTrack = playableTracks.find((_, idx, arr) => {
      const currentPlayableIndex = arr.findIndex(t => t.id === currentTrack.id);
      return idx > currentPlayableIndex;
    });
    
    if (nextPlayableTrack) {
      setCurrentTrack(nextPlayableTrack);
      setIsPlaying(true);
      setCurrentTime(0);
    }
  };

  const playPrevious = () => {
    if (!currentTrack || !album.trackList) return;
    const playableTracks = album.trackList.filter(t => t.file && t.file.trim() !== '');
    const currentPlayableIndex = playableTracks.findIndex(t => t.id === currentTrack.id);
    
    if (currentPlayableIndex > 0) {
      const prevTrack = playableTracks[currentPlayableIndex - 1];
      setCurrentTrack(prevTrack);
      setIsPlaying(true);
      setCurrentTime(0);
    }
  };

  const playAlbum = () => {
    if (album.trackList && album.trackList.length > 0) {
      const firstPlayableTrack = album.trackList.find(t => t.file && t.file.trim() !== '');
      if (firstPlayableTrack) {
        setCurrentTrack(firstPlayableTrack);
        setIsPlaying(true);
        setCurrentTime(0);
      } else {
        alert('В этом альбоме нет загруженных аудиофайлов. Добавьте файлы в админ-панели.');
      }
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio && currentTrack?.file) {
      const loadAudio = async () => {
        try {
          console.log('🎵 Загружаем трек:', currentTrack.title);
          console.log('📂 Файл трека:', currentTrack.file);
          
          let audioUrl = currentTrack.file;
          
          if (audioUrl.startsWith('audio_')) {
            console.log('🔍 Пытаемся загрузить аудиофайл из IndexedDB:', audioUrl);
            try {
              audioUrl = await getAudioFromIndexedDB(audioUrl);
              console.log('✅ Аудио получено из IndexedDB');
            } catch (indexedDBError) {
              console.log('⚠️ Файл не найден в IndexedDB, загружаем с сервера:', audioUrl);
              
              const { apiClient } = await import('@/utils/apiClient');
              const serverAudioData = await apiClient.getMediaFile(audioUrl);
              
              if (serverAudioData && serverAudioData.startsWith('data:audio/')) {
                console.log('✅ Аудио получено с сервера');
                audioUrl = serverAudioData;
              } else {
                console.error('❌ Не удалось загрузить аудиофайл с сервера');
                alert(`Не удалось загрузить трек "${currentTrack.title}". Файл не найден.`);
                setIsPlaying(false);
                return;
              }
            }
          } else {
            console.log('🌐 Используем прямую ссылку на аудио:', audioUrl);
          }
          
          if (!audioUrl) {
            console.error('❌ Не удалось получить URL аудиофайла для:', currentTrack.title);
            setIsPlaying(false);
            return;
          }
          
          audio.src = audioUrl;
          audio.load();
          setCurrentTime(0);
          setDuration(0);
          
          console.log('🎧 Аудиоэлемент настроен, isPlaying:', isPlaying);
          
          if (isPlaying) {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => console.log('▶️ Воспроизведение началось успешно'))
                .catch((error) => {
                  console.error('❌ Ошибка воспроизведения:', error);
                  setIsPlaying(false);
                });
            }
          }
        } catch (error) {
          console.error('❌ Ошибка загрузки аудио для трека:', currentTrack.title, error);
          alert(`Ошибка загрузки трека "${currentTrack.title}"`);
          setIsPlaying(false);
        }
      };
      
      loadAudio();
    }
  }, [currentTrack]);

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
      const handleEnded = () => {
        const currentIndex = album.trackList.findIndex(t => t.id === currentTrack?.id);
        if (currentIndex < album.trackList.length - 1) {
          playNext();
        } else {
          setIsPlaying(false);
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
  }, [currentTrack, album.trackList]);

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleAddTrackToCart = (track: Track) => {
    console.log('🛒 Добавляем трек в корзину:', track.title, track);
    onAddToCart({
      id: track.id,
      title: track.title,
      type: 'track',
      price: track.price,
      quantity: 1
    });
    console.log('✅ Трек отправлен в onAddToCart');
  };

  const handleAddAlbumToCart = () => {
    onAddToCart({
      id: album.id,
      title: album.title,
      type: 'album',
      price: album.price,
      quantity: 1
    });
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
                <p className="text-xl text-vintage-warm/70 mb-4">{album.artist}</p>
                <p className="text-vintage-warm/60 mb-4">{album.description}</p>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-vintage-warm/60">{album.tracks} треков</span>
                  <span className="text-2xl font-bold text-vintage-dark-brown">{album.price} ₽</span>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={playAlbum}
                    className="bg-vintage-warm hover:bg-vintage-brown text-vintage-cream"
                  >
                    <Icon name="Play" size={16} className="mr-2" />
                    Слушать альбом
                  </Button>
                  <Button
                    onClick={handleAddAlbumToCart}
                    variant="outline"
                    className="border-vintage-dark-brown text-vintage-dark-brown hover:bg-vintage-dark-brown hover:text-vintage-cream"
                  >
                    <Icon name="ShoppingCart" size={16} className="mr-2" />
                    Купить
                  </Button>
                </div>
              </div>
            </div>

            {/* Список треков */}
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-vintage-warm mb-4">Треки</h3>
              {album.trackList.map((track, index) => {
                const hasAudioFile = track.file && track.file.trim() !== '';
                return (
                  <div
                    key={track.id}
                    className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                      currentTrack?.id === track.id
                        ? 'bg-vintage-dark-brown/20 border border-vintage-dark-brown/30'
                        : 'bg-vintage-brown/10 hover:bg-vintage-brown/15'
                    } ${!hasAudioFile ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-vintage-warm/60 w-8 text-center font-mono">
                        {(index + 1).toString().padStart(2, '0')}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePlayTrack(track)}
                        disabled={!hasAudioFile}
                        className="text-vintage-dark-brown hover:bg-vintage-brown/20 w-10 h-10 rounded-full disabled:opacity-30"
                        title={!hasAudioFile ? 'Аудиофайл не загружен' : 'Воспроизвести'}
                      >
                        {currentTrack?.id === track.id && isPlaying ? (
                          <Icon name="Pause" size={16} />
                        ) : (
                          <Icon name="Play" size={16} />
                        )}
                      </Button>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-vintage-warm">{track.title}</p>
                          {!hasAudioFile && (
                            <Badge variant="outline" className="text-xs bg-red-500/10 text-red-700 border-red-300">
                              Нет файла
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-vintage-warm/60">{track.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-vintage-dark-brown">{track.price} ₽</span>
                      <Button
                        onClick={() => handleAddTrackToCart(track)}
                        variant="outline"
                        size="sm"
                        className="border-vintage-brown/30 text-vintage-dark-brown hover:bg-vintage-brown/10"
                      >
                        <Icon name="ShoppingCart" size={14} className="mr-1" />
                        Купить
                      </Button>
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
                      <div className="flex-1 bg-vintage-brown/20 rounded-full h-1">
                        <div
                          className="bg-vintage-dark-brown h-1 rounded-full transition-all duration-300"
                          style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-vintage-warm/60">{currentTrack.duration}</span>
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

                {/* Скрытый аудио элемент */}
                <audio
                  ref={audioRef}
                  preload="metadata"
                  onError={() => console.warn('Ошибка загрузки аудиофайла')}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlbumView;