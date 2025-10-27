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
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-vintage-warm mb-1">🔥 Топ треков</h3>
        <p className="text-sm text-vintage-warm/70">Самые популярные</p>
      </div>

      <div className="space-y-2">
        {tracks.map((track, index) => (
          <Card 
            key={track.id}
            className="bg-vintage-cream/95 backdrop-blur-sm border-vintage-brown/20 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'backwards' }}
            onClick={() => onTrackClick && track.album_id && onTrackClick(track.album_id)}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                  {index < 3 ? (
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500/20 text-yellow-600' :
                      index === 1 ? 'bg-gray-400/20 text-gray-600' :
                      'bg-orange-600/20 text-orange-700'
                    }`}>
                      {index + 1}
                    </div>
                  ) : (
                    <span className="text-vintage-brown/60 font-mono text-sm">{index + 1}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-vintage-dark-brown text-sm truncate group-hover:text-vintage-warm transition-colors">
                    {track.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    {track.album_title && (
                      <p className="text-xs text-vintage-warm/70 truncate">
                        {track.album_title}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1 text-vintage-warm">
                    <Icon name="Headphones" size={12} />
                    <span className="font-semibold text-xs">{track.plays_count}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TopTracks;