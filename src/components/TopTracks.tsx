import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface TopTrack {
  id: string;
  title: string;
  duration: string;
  price: number;
  plays_count: number;
  album_id: string;
  album_title?: string;
  username?: string;
  display_name?: string;
  cover?: string;
}

interface TopTracksProps {
  username?: string;
  limit?: number;
  onTrackClick?: (albumId: string) => void;
}

const TopTracks = ({ username, limit = 5, onTrackClick }: TopTracksProps) => {
  const [tracks, setTracks] = useState<TopTrack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopTracks();
  }, [username, limit]);

  const fetchTopTracks = async () => {
    try {
      const params = new URLSearchParams({ limit: limit.toString() });
      if (username) params.append('username', username);
      
      const response = await fetch(
        `https://functions.poehali.dev/52119c2a-82db-4422-894d-e3d5db04d16a?path=tracks/top&${params.toString()}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setTracks(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки топ треков:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <Icon name="Music" size={32} className="mx-auto mb-2 text-vintage-warm/40 animate-pulse" />
        <p className="text-vintage-warm/60">Загрузка топ треков...</p>
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="text-center py-8">
        <Icon name="Music" size={32} className="mx-auto mb-2 text-vintage-warm/40" />
        <p className="text-vintage-warm/60">Пока нет прослушиваний</p>
      </div>
    );
  }

  return (
    <section className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold text-vintage-warm mb-2">🔥 Топ треков</h3>
          <p className="text-vintage-warm/70">Самые популярные композиции</p>
        </div>

        <div className="space-y-3">
          {tracks.map((track, index) => (
            <Card 
              key={track.id}
              className="bg-vintage-cream/95 backdrop-blur-sm border-vintage-brown/20 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group"
              onClick={() => onTrackClick && track.album_id && onTrackClick(track.album_id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                    {index < 3 ? (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                        index === 0 ? 'bg-yellow-500/20 text-yellow-600' :
                        index === 1 ? 'bg-gray-400/20 text-gray-600' :
                        'bg-orange-600/20 text-orange-700'
                      }`}>
                        {index + 1}
                      </div>
                    ) : (
                      <span className="text-vintage-brown/60 font-mono text-lg">{index + 1}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-vintage-dark-brown text-base truncate group-hover:text-vintage-warm transition-colors">
                      {track.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                      {track.album_title && (
                        <p className="text-xs text-vintage-warm/70 truncate">
                          {track.album_title}
                        </p>
                      )}
                      <p className="text-xs text-vintage-brown/60">
                        {track.duration}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-vintage-warm">
                        <Icon name="Headphones" size={14} />
                        <span className="font-semibold text-sm">{track.plays_count}</span>
                      </div>
                      <p className="text-xs text-vintage-brown/60 mt-0.5">прослушиваний</p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-vintage-warm hover:text-vintage-dark-brown hover:bg-vintage-brown/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTrackClick && track.album_id && onTrackClick(track.album_id);
                      }}
                    >
                      <Icon name="Play" size={18} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopTracks;
