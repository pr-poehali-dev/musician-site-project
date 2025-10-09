import React, { useCallback } from 'react';
import { Button } from "@/components/ui/button";
import Icon from '@/components/ui/icon';
import { Track } from '@/types';

interface TrackListItemProps {
  track: Track;
  onRemove: (trackId: string) => void;
}

const TrackListItem: React.FC<TrackListItemProps> = ({ track, onRemove }) => {
  const handleRemove = useCallback(() => {
    onRemove(track.id);
  }, [onRemove, track.id]);

  return (
    <div className="flex items-center justify-between p-3 bg-vintage-brown/10 rounded-lg">
      <div className="flex items-center gap-3">
        {track.cover ? (
          <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
            <img src={track.cover} alt={track.title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-12 h-12 bg-vintage-dark-brown/20 rounded flex items-center justify-center flex-shrink-0">
            <Icon name="Music" size={20} className="text-vintage-dark-brown" />
          </div>
        )}
        <div>
          <p className="font-medium text-vintage-warm">{track.title}</p>
          <p className="text-sm text-vintage-warm/60">{track.duration}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-bold text-vintage-dark-brown">{track.price} ₽</span>
        <Button 
          onClick={handleRemove}
          variant="outline"
          size="sm"
          className="text-red-500 border-red-300 hover:bg-red-50"
        >
          <Icon name="Trash2" size={14} />
        </Button>
      </div>
    </div>
  );
};

export default React.memo(TrackListItem);