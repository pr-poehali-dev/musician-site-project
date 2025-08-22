import { useState, useEffect } from 'react';
import { Track } from '@/types';
import Icon from '@/components/ui/icon';

interface TrackListProps {
  onTrackSelect: (track: Track) => void;
  currentTrack: Track | null;
  isPlaying: boolean;
}

const TrackList = ({ onTrackSelect, currentTrack, isPlaying }: TrackListProps) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Загружаем треки из localStorage (сохраненные через админ-панель)
    const loadTracks = () => {
      try {
        const savedTracks = localStorage.getItem('uploadedTracks');
        if (savedTracks) {
          const parsedTracks = JSON.parse(savedTracks);
          setTracks(parsedTracks);
        }
        setLoading(false);
      } catch (error) {
        console.error('Ошибка загрузки треков:', error);
        setLoading(false);
      }
    };

    loadTracks();

    // Обновляем список при изменении localStorage
    const handleStorageChange = () => {
      loadTracks();
    };

    window.addEventListener('tracksUpdated', handleStorageChange);
    return () => window.removeEventListener('tracksUpdated', handleStorageChange);
  }, []);

  const formatDuration = (duration: string) => {
    // Если duration уже в формате MM:SS, возвращаем как есть
    if (duration.includes(':')) {
      return duration;
    }
    // Если это число секунд, конвертируем
    const seconds = parseInt(duration);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <section className="py-16 px-6 bg-vintage-brown/30">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-4xl font-bold text-vintage-cream mb-8 text-center">
            Последние треки
          </h3>
          <div className="text-center text-vintage-cream/60">
            <Icon name="Loader2" className="animate-spin mx-auto mb-4" size={32} />
            Загружаем треки...
          </div>
        </div>
      </section>
    );
  }

  if (tracks.length === 0) {
    return (
      <section className="py-16 px-6 bg-vintage-brown/30">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-4xl font-bold text-vintage-cream mb-8 text-center">
            Последние треки
          </h3>
          <div className="text-center text-vintage-cream/60">
            <Icon name="Music" className="mx-auto mb-4" size={48} />
            <p>Пока нет загруженных треков</p>
            <p className="text-sm mt-2">Треки появятся здесь после загрузки через админ-панель</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-6 bg-vintage-brown/30">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-4xl font-bold text-vintage-cream mb-8 text-center">
          Последние треки
        </h3>
        
        <div className="space-y-4">
          {tracks.map((track) => {
            const isCurrentTrack = currentTrack?.id === track.id;
            const isCurrentlyPlaying = isCurrentTrack && isPlaying;

            return (
              <div
                key={track.id}
                className={`
                  flex items-center p-4 rounded-lg cursor-pointer transition-all
                  ${isCurrentTrack 
                    ? 'bg-vintage-warm/20 border-2 border-vintage-warm' 
                    : 'bg-vintage-dark-brown/40 hover:bg-vintage-dark-brown/60 border-2 border-transparent'
                  }
                  backdrop-blur-sm
                `}
                onClick={() => onTrackSelect(track)}
              >
                {/* Play/Pause кнопка */}
                <button 
                  className={`
                    flex items-center justify-center w-12 h-12 rounded-full mr-4 transition-all
                    ${isCurrentTrack 
                      ? 'bg-vintage-warm text-vintage-dark-brown' 
                      : 'bg-vintage-cream/20 text-vintage-cream hover:bg-vintage-cream/30'
                    }
                  `}
                >
                  {isCurrentlyPlaying ? (
                    <Icon name="Pause" size={20} />
                  ) : (
                    <Icon name="Play" size={20} />
                  )}
                </button>

                {/* Информация о треке */}
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-vintage-cream mb-1">
                    {track.title}
                  </h4>
                  <p className="text-vintage-cream/60 text-sm">
                    Vintage Soul • {formatDuration(track.duration)}
                  </p>
                </div>

                {/* Индикатор воспроизведения */}
                {isCurrentlyPlaying && (
                  <div className="flex items-center space-x-1 mr-4">
                    <div className="w-1 h-4 bg-vintage-warm animate-pulse rounded-full"></div>
                    <div className="w-1 h-6 bg-vintage-warm animate-pulse rounded-full" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-1 h-4 bg-vintage-warm animate-pulse rounded-full" style={{animationDelay: '0.2s'}}></div>
                  </div>
                )}

                {/* Иконка музыки для неактивных треков */}
                {!isCurrentTrack && (
                  <Icon 
                    name="Music" 
                    size={20} 
                    className="text-vintage-cream/40" 
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Подсказка для пользователя */}
        <div className="mt-8 text-center">
          <p className="text-vintage-cream/50 text-sm">
            Нажмите на трек, чтобы начать прослушивание
          </p>
        </div>
      </div>
    </section>
  );
};

export default TrackList;