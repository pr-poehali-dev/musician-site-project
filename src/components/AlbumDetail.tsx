import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import TrackForm, { TrackFormData } from '@/components/TrackForm';
import { useToast } from '@/hooks/use-toast';

interface Track {
  id: number;
  title: string;
  duration: number;
  preview_url?: string;
  file_url?: string;
  price: number;
  label?: string;
  genre?: string;
  plays_count?: number;
  created_at: string;
}

interface Album {
  id: number;
  title: string;
  cover_url?: string;
  price: number;
}

interface AlbumDetailProps {
  album: Album;
  token: string;
  onBack: () => void;
}

const AlbumDetail = ({ album, token, onBack }: AlbumDetailProps) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddTrackOpen, setIsAddTrackOpen] = useState(false);
  const [isEditTrackOpen, setIsEditTrackOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const { toast } = useToast();

  const USER_MUSIC_API = 'https://functions.poehali.dev/user-music';

  useEffect(() => {
    fetchTracks();
  }, [album.id]);

  const fetchTracks = async () => {
    try {
      const response = await fetch(`${USER_MUSIC_API}?path=tracks&album_id=${album.id}`, {
        headers: {
          'X-Auth-Token': token,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTracks(data);
      }
    } catch (error) {
      console.error('Error fetching tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTrack = async (trackData: TrackFormData) => {
    try {
      const response = await fetch(`${USER_MUSIC_API}?path=tracks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token,
        },
        body: JSON.stringify(trackData),
      });

      if (response.ok) {
        toast({
          title: 'Трек добавлен!',
          description: 'Трек успешно добавлен в альбом',
        });
        setIsAddTrackOpen(false);
        fetchTracks();
      } else {
        const error = await response.json();
        toast({
          title: 'Ошибка',
          description: error.message || 'Не удалось добавить трек',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при добавлении трека',
        variant: 'destructive',
      });
    }
  };

  const handleEditTrack = async (trackData: TrackFormData) => {
    if (!editingTrack) return;

    try {
      const response = await fetch(`${USER_MUSIC_API}?path=tracks&id=${editingTrack.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token,
        },
        body: JSON.stringify(trackData),
      });

      if (response.ok) {
        toast({
          title: 'Трек обновлён!',
          description: 'Изменения сохранены',
        });
        setIsEditTrackOpen(false);
        setEditingTrack(null);
        fetchTracks();
      } else {
        const error = await response.json();
        toast({
          title: 'Ошибка',
          description: error.message || 'Не удалось обновить трек',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при обновлении трека',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (track: Track) => {
    setEditingTrack(track);
    setIsEditTrackOpen(true);
  };

  const handleDeleteTrack = async (trackId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот трек?')) return;

    try {
      const response = await fetch(`${USER_MUSIC_API}?path=tracks&id=${trackId}`, {
        method: 'DELETE',
        headers: {
          'X-Auth-Token': token,
        },
      });

      if (response.ok) {
        toast({
          title: 'Трек удалён',
          description: 'Трек успешно удалён',
        });
        fetchTracks();
      } else {
        toast({
          title: 'Ошибка',
          description: 'Не удалось удалить трек',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при удалении трека',
        variant: 'destructive',
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-6 text-vintage-brown hover:text-vintage-dark-brown"
      >
        <Icon name="ArrowLeft" size={20} className="mr-2" />
        Назад к альбомам
      </Button>

      <div className="mb-6 flex items-start gap-6">
        {album.cover_url && (
          <img
            src={album.cover_url}
            alt={album.title}
            className="w-48 h-48 object-cover rounded-lg border-2 border-vintage-brown/20"
          />
        )}
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-vintage-dark-brown mb-2">{album.title}</h2>
          <p className="text-vintage-brown mb-4">{album.price} ₽</p>
          <Button
            onClick={() => setIsAddTrackOpen(true)}
            className="bg-vintage-warm hover:bg-vintage-brown text-vintage-cream"
          >
            <Icon name="Plus" size={20} className="mr-2" />
            Добавить трек
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-vintage-brown text-center py-8">Загрузка треков...</p>
      ) : tracks.length === 0 ? (
        <Card className="bg-vintage-cream/80 border-vintage-brown/30">
          <CardContent className="p-12 text-center">
            <Icon name="Music" size={48} className="mx-auto mb-4 text-vintage-brown/40" />
            <p className="text-vintage-brown mb-4">В этом альбоме пока нет треков</p>
            <Button
              onClick={() => setIsAddTrackOpen(true)}
              className="bg-vintage-warm hover:bg-vintage-brown text-vintage-cream"
            >
              <Icon name="Plus" size={20} className="mr-2" />
              Добавить первый трек
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {tracks.map((track, index) => (
            <Card key={track.id} className="bg-vintage-cream/80 border-vintage-brown/30">
              <CardContent className="p-4 flex items-center gap-4">
                <span className="text-vintage-brown/60 font-mono w-8">{index + 1}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-vintage-dark-brown">{track.title}</h3>
                  <div className="flex gap-3 items-center mt-1">
                    {track.genre && (
                      <p className="text-xs text-vintage-warm">
                        <Icon name="Music" size={12} className="inline mr-1" />
                        {track.genre}
                      </p>
                    )}
                    {track.label && (
                      <p className="text-xs text-vintage-brown/70">
                        <Icon name="Tag" size={12} className="inline mr-1" />
                        {track.label}
                      </p>
                    )}
                    {track.plays_count !== undefined && track.plays_count > 0 && (
                      <p className="text-xs text-vintage-brown/70">
                        <Icon name="Headphones" size={12} className="inline mr-1" />
                        {track.plays_count}
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-vintage-brown mt-1">
                    {track.duration > 0 ? formatDuration(track.duration) : '—'} • {track.price} ₽
                  </p>
                </div>
                {track.preview_url && (
                  <audio src={track.preview_url} controls className="max-w-xs" />
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(track)}
                    className="border-vintage-brown/30 hover:bg-vintage-brown/10"
                  >
                    <Icon name="Edit" size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteTrack(track.id)}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isAddTrackOpen} onOpenChange={setIsAddTrackOpen}>
        <DialogContent className="bg-vintage-cream border-vintage-brown/30">
          <DialogHeader>
            <DialogTitle className="text-vintage-dark-brown">Добавить трек</DialogTitle>
          </DialogHeader>
          <TrackForm
            albumId={album.id}
            onSubmit={handleAddTrack}
            onCancel={() => setIsAddTrackOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditTrackOpen} onOpenChange={setIsEditTrackOpen}>
        <DialogContent className="bg-vintage-cream border-vintage-brown/30">
          <DialogHeader>
            <DialogTitle className="text-vintage-dark-brown">Редактировать трек</DialogTitle>
          </DialogHeader>
          {editingTrack && (
            <TrackForm
              albumId={album.id}
              onSubmit={handleEditTrack}
              onCancel={() => {
                setIsEditTrackOpen(false);
                setEditingTrack(null);
              }}
              initialData={{
                title: editingTrack.title,
                album_id: album.id,
                duration: editingTrack.duration,
                preview_url: editingTrack.preview_url || '',
                file_url: editingTrack.file_url || '',
                price: editingTrack.price,
                label: editingTrack.label || '',
              }}
              isEditing
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AlbumDetail;