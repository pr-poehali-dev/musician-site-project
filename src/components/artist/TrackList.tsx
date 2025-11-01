import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Track {
  id: number;
  title: string;
  duration: number;
  preview_url?: string;
  price: number;
  album_id: number;
  label?: string;
  genre?: string;
  plays_count?: number;
}

interface TrackListProps {
  tracks: Track[];
  currentTrack: Track | null;
  onPlayTrack: (track: Track) => void;
}

const TrackList = ({ tracks, currentTrack, onPlayTrack }: TrackListProps) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-2">
      {tracks.map((track, index) => (
        <div
          key={track.id}
          className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
            currentTrack?.id === track.id
              ? 'bg-vintage-warm/20 border-2 border-vintage-warm'
              : 'bg-vintage-cream/50 hover:bg-vintage-cream/80'
          }`}
        >
          <span className="text-vintage-brown font-mono w-8 text-right">
            {(index + 1).toString().padStart(2, '0')}
          </span>
          
          <Button
            size="sm"
            variant={currentTrack?.id === track.id ? "default" : "outline"}
            className={
              currentTrack?.id === track.id
                ? "bg-vintage-warm hover:bg-vintage-brown text-vintage-cream"
                : "border-vintage-brown/30 text-vintage-brown hover:bg-vintage-brown hover:text-vintage-cream"
            }
            onClick={() => onPlayTrack(track)}
          >
            <Icon 
              name={currentTrack?.id === track.id ? "Pause" : "Play"} 
              size={14} 
            />
          </Button>

          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-vintage-dark-brown truncate">
              {track.title}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              {track.label && (
                <Badge variant="outline" className="text-xs border-vintage-brown/30 text-vintage-brown">
                  {track.label}
                </Badge>
              )}
              {track.genre && (
                <Badge variant="outline" className="text-xs border-vintage-brown/30 text-vintage-brown">
                  {track.genre}
                </Badge>
              )}
              <div className="flex items-center gap-1 text-xs text-vintage-brown/70">
                <Icon name="Headphones" size={12} />
                <span>{track.plays_count || 0}</span>
              </div>
            </div>
          </div>

          <span className="text-vintage-brown font-mono text-sm">
            {formatDuration(track.duration)}
          </span>

          {track.price > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-vintage-warm font-bold">{track.price} ₽</span>
              <Button 
                size="sm"
                variant="outline"
                className="border-vintage-warm text-vintage-warm hover:bg-vintage-warm hover:text-vintage-cream"
              >
                <Icon name="ShoppingCart" size={14} />
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TrackList;