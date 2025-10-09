import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from '@/components/ui/icon';
import { Album, Track } from '@/types';

interface AlbumCardProps {
  album: Album;
  isExpanded: boolean;
  selectedTracks: string[];
  onToggleExpanded: () => void;
  onSelectAllTracks: () => void;
  onBulkMove: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleTrackSelection: (trackId: string) => void;
  onMoveTrack: (track: Track, albumId: string) => void;
  onEditTrack: (track: Track) => void;
  onDeleteTrack: (trackId: string) => void;
}

const AlbumCard: React.FC<AlbumCardProps> = ({
  album,
  isExpanded,
  selectedTracks,
  onToggleExpanded,
  onSelectAllTracks,
  onBulkMove,
  onEdit,
  onDelete,
  onToggleTrackSelection,
  onMoveTrack,
  onEditTrack,
  onDeleteTrack
}) => {
  const hasTracksInAlbum = album.trackList && album.trackList.length > 0;
  const allTracksSelected = hasTracksInAlbum && album.trackList!.every(t => selectedTracks.includes(t.id));
  const someTracksSelected = selectedTracks.some(id => album.trackList?.some(t => t.id === id));
  const selectedInAlbumCount = selectedTracks.filter(id => album.trackList?.some(t => t.id === id)).length;

  return (
    <Card className="bg-vintage-cream/95 border-vintage-brown/20">
      <CardContent className="p-4">
        <div className="flex gap-3 mb-3">
          {album.cover ? (
            <div className="w-20 h-20 rounded overflow-hidden flex-shrink-0">
              <img src={album.cover} alt={album.title} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-vintage-dark-brown/20 rounded flex items-center justify-center flex-shrink-0">
              <Icon name="Disc" size={32} className="text-vintage-dark-brown" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex justify-between items-start mb-1">
              <div>
                <h4 className="font-bold text-vintage-warm">{album.title}</h4>
                <p className="text-sm text-vintage-warm/70">{album.artist}</p>
              </div>
              <Badge className="bg-vintage-dark-brown text-vintage-cream">
                {album.tracks} треков
              </Badge>
            </div>
            <p className="text-sm text-vintage-warm/60 line-clamp-2">{album.description}</p>
          </div>
        </div>
        <div className="flex items-center justify-between mb-3">
          <p className="font-bold text-vintage-dark-brown">{album.price} ₽</p>
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={onToggleExpanded}
              variant="outline"
              size="sm"
              className="border-vintage-brown text-vintage-dark-brown hover:bg-vintage-brown hover:text-vintage-cream"
            >
              <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={14} className="mr-1" />
              Треки
            </Button>
            {isExpanded && hasTracksInAlbum && (
              <>
                <Button 
                  onClick={onSelectAllTracks}
                  variant="outline"
                  size="sm"
                  className="border-vintage-brown text-vintage-dark-brown hover:bg-vintage-brown hover:text-vintage-cream"
                  title="Выбрать все треки"
                >
                  <Icon name="CheckSquare" size={14} className="mr-1" />
                  {allTracksSelected ? 'Снять' : 'Выбрать'}
                </Button>
                {someTracksSelected && (
                  <Button 
                    onClick={onBulkMove}
                    variant="outline"
                    size="sm"
                    className="border-vintage-dark-brown text-vintage-dark-brown hover:bg-vintage-dark-brown hover:text-vintage-cream"
                  >
                    <Icon name="FolderOutput" size={14} className="mr-1" />
                    Переместить ({selectedInAlbumCount})
                  </Button>
                )}
              </>
            )}
            <Button 
              onClick={onEdit}
              variant="outline"
              size="sm"
              className="border-vintage-brown text-vintage-dark-brown hover:bg-vintage-brown hover:text-vintage-cream"
            >
              <Icon name="Edit" size={14} />
            </Button>
            <Button 
              onClick={onDelete}
              variant="outline"
              size="sm"
              className="text-red-500 border-red-300 hover:bg-red-50"
            >
              <Icon name="Trash2" size={14} />
            </Button>
          </div>
        </div>
        
        {isExpanded && hasTracksInAlbum && (
          <div className="mt-3 pt-3 border-t border-vintage-brown/20">
            <h5 className="text-sm font-semibold text-vintage-warm mb-2">Треки альбома:</h5>
            <div className="space-y-2">
              {album.trackList!.map((track) => (
                <div 
                  key={track.id} 
                  className={`flex items-center justify-between p-2 bg-vintage-brown/10 rounded-lg transition-colors ${
                    selectedTracks.includes(track.id) ? 'ring-2 ring-vintage-dark-brown bg-vintage-brown/20' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <button
                      onClick={() => onToggleTrackSelection(track.id)}
                      className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        selectedTracks.includes(track.id) 
                          ? 'bg-vintage-dark-brown border-vintage-dark-brown' 
                          : 'border-vintage-brown/40 hover:border-vintage-dark-brown'
                      }`}
                      title="Выбрать трек"
                    >
                      {selectedTracks.includes(track.id) && (
                        <Icon name="Check" size={14} className="text-vintage-cream" />
                      )}
                    </button>
                    <Icon name="Music" size={14} className="text-vintage-dark-brown flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-vintage-warm truncate">{track.title}</p>
                      <div className="flex gap-2 text-xs text-vintage-warm/60">
                        <span>{track.duration}</span>
                        <span>•</span>
                        <span>{track.price} ₽</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button 
                      onClick={() => onMoveTrack(track, album.id)}
                      variant="ghost"
                      size="sm"
                      className="text-vintage-dark-brown hover:bg-vintage-brown/20 h-7 w-7 p-0"
                      title="Переместить в другой альбом"
                    >
                      <Icon name="Move" size={12} />
                    </Button>
                    <Button 
                      onClick={() => onEditTrack(track)}
                      variant="ghost"
                      size="sm"
                      className="text-vintage-dark-brown hover:bg-vintage-brown/20 h-7 w-7 p-0"
                      title="Редактировать трек"
                    >
                      <Icon name="Edit" size={12} />
                    </Button>
                    <Button 
                      onClick={() => onDeleteTrack(track.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:bg-red-50 h-7 w-7 p-0"
                      title="Удалить трек"
                    >
                      <Icon name="Trash2" size={12} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {isExpanded && (!album.trackList || album.trackList.length === 0) && (
          <div className="mt-3 pt-3 border-t border-vintage-brown/20">
            <p className="text-sm text-vintage-warm/60 text-center">Треков пока нет</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlbumCard;
