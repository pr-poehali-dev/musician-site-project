import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayTrack = (track: Track) => {
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
  }, [currentTrack, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const updateTime = () => setCurrentTime(audio.currentTime);
      const updateDuration = () => setDuration(audio.duration);
      const handleEnded = () => setIsPlaying(false);
      
      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('loadedmetadata', updateDuration);
      audio.addEventListener('ended', handleEnded);
      
      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('loadedmetadata', updateDuration);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, []);

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleAddTrackToCart = (track: Track) => {
    onAddToCart({
      id: track.id,
      title: track.title,
      type: 'track',
      price: track.price,
      quantity: 1
    });
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
                <Button
                  onClick={handleAddAlbumToCart}
                  className="bg-vintage-dark-brown hover:bg-vintage-warm text-vintage-cream"
                >
                  <Icon name="ShoppingCart" size={16} className="mr-2" />
                  Купить альбом
                </Button>
              </div>
            </div>

            {/* Список треков */}
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-vintage-warm mb-4">Треки</h3>
              {album.trackList.map((track, index) => (
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
                    >
                      {currentTrack?.id === track.id && isPlaying ? (
                        <Icon name="Pause" size={16} />
                      ) : (
                        <Icon name="Play" size={16} />
                      )}
                    </Button>
                    <div className="flex-1">
                      <p className="font-medium text-vintage-warm">{track.title}</p>
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
              ))}
            </div>

            {/* Мини-плеер */}
            {currentTrack && (
              <div className="mt-8 p-4 bg-vintage-brown/10 rounded-lg border border-vintage-brown/20">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => handlePlayTrack(currentTrack)}
                    className="bg-vintage-dark-brown hover:bg-vintage-warm text-vintage-cream w-12 h-12 rounded-full"
                  >
                    <Icon name={isPlaying ? "Pause" : "Play"} size={20} />
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
                  <Icon name="Volume2" size={20} className="text-vintage-dark-brown" />
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