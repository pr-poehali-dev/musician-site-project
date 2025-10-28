import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Logo from '@/components/Logo';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import ProfileEditForm, { ProfileFormData } from '@/components/ProfileEditForm';

interface Album {
  id: number;
  title: string;
  cover_url?: string;
  price: number;
  created_at: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
}

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

interface Artist {
  username: string;
  display_name: string;
  avatar_url?: string;
  banner_url?: string;
  bio?: string;
}

const Artist = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, token } = useAuth();
  
  const [artist, setArtist] = useState<Artist | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [tracks, setTracks] = useState<{ [albumId: number]: Track[] }>({});
  const [loading, setLoading] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState<number | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const USER_MUSIC_API = 'https://functions.poehali.dev/52119c2a-82db-4422-894d-e3d5db04d16a';

  useEffect(() => {
    if (username) {
      fetchArtistData();
    }
  }, [username]);

  const fetchArtistData = async () => {
    try {
      const profileResponse = await fetch(`${USER_MUSIC_API}?path=profile&username=${username}`);
      
      if (!profileResponse.ok) {
        toast({
          title: 'Артист не найден',
          description: 'Такого пользователя не существует',
          variant: 'destructive',
        });
        navigate('/');
        return;
      }

      const profileData = await profileResponse.json();
      setArtist({
        username: profileData.username,
        display_name: profileData.display_name,
        avatar_url: profileData.avatar_url,
        banner_url: profileData.banner_url,
        bio: profileData.profile_bio || profileData.bio,
      });

      const albumsResponse = await fetch(`${USER_MUSIC_API}?path=albums&username=${username}`);
      
      if (albumsResponse.ok) {
        const albumsData = await albumsResponse.json();
        setAlbums(albumsData);

        for (const album of albumsData) {
          const tracksResponse = await fetch(`${USER_MUSIC_API}?path=tracks&album_id=${album.id}`);
          if (tracksResponse.ok) {
            const tracksData = await tracksResponse.json();
            setTracks(prev => ({ ...prev, [album.id]: tracksData }));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching artist data:', error);
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить данные артиста',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const playTrack = async (track: Track) => {
    setCurrentTrack(track);
    
    // Увеличиваем счётчик прослушиваний
    try {
      await fetch(`${USER_MUSIC_API}?path=track-play`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ track_id: track.id }),
      });
      
      // Обновляем локальное значение счётчика
      setTracks(prevTracks => {
        const updatedTracks = { ...prevTracks };
        if (updatedTracks[track.album_id]) {
          updatedTracks[track.album_id] = updatedTracks[track.album_id].map(t =>
            t.id === track.id ? { ...t, plays_count: (t.plays_count || 0) + 1 } : t
          );
        }
        return updatedTracks;
      });
    } catch (error) {
      console.error('Error updating play count:', error);
    }
  };

  const handleUpdateProfile = async (profileData: ProfileFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${USER_MUSIC_API}?path=profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token!,
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        toast({
          title: 'Профиль обновлён!',
          description: 'Изменения успешно сохранены',
        });
        setIsEditDialogOpen(false);
        fetchArtistData();
      } else {
        const error = await response.json();
        toast({
          title: 'Ошибка',
          description: error.message || 'Не удалось обновить профиль',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при обновлении профиля',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-vintage-cream via-vintage-brown to-vintage-dark-brown flex items-center justify-center">
        <div className="text-vintage-warm text-xl">Загрузка...</div>
      </div>
    );
  }

  if (!artist) {
    return null;
  }

  const isOwnProfile = user?.username === artist?.username;

  return (
    <div className="min-h-screen bg-gradient-to-br from-vintage-cream via-vintage-brown to-vintage-dark-brown">
      <header className="p-6 backdrop-blur-sm bg-vintage-cream/80 border-b border-vintage-brown/20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo />
          <div className="flex gap-3">
            {user ? (
              <Button 
                variant="outline"
                className="border-vintage-brown/30 text-vintage-brown hover:bg-vintage-brown hover:text-vintage-cream"
                onClick={() => navigate('/dashboard')}
              >
                <Icon name="LayoutDashboard" size={16} className="mr-2" />
                Панель управления
              </Button>
            ) : (
              <Button 
                variant="outline"
                className="border-vintage-brown/30 text-vintage-brown hover:bg-vintage-brown hover:text-vintage-cream"
                onClick={() => navigate('/auth')}
              >
                <Icon name="LogIn" size={16} className="mr-2" />
                Вход
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="mb-12">
          {artist.banner_url && (
            <div className="mb-6 -mx-6 -mt-6">
              <img 
                src={artist.banner_url} 
                alt="Баннер"
                className="w-full h-64 object-cover"
              />
            </div>
          )}
          <div className="flex items-center gap-6 mb-6">
            {artist.avatar_url ? (
              <img 
                src={artist.avatar_url} 
                alt={artist.display_name}
                className="w-32 h-32 rounded-full object-cover border-4 border-vintage-warm/40"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-vintage-brown/30 flex items-center justify-center border-4 border-vintage-warm/40">
                <Icon name="User" size={48} className="text-vintage-warm" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-5xl font-bold text-vintage-dark-brown">{artist.display_name}</h1>
                {isOwnProfile && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditDialogOpen(true)}
                    className="border-vintage-brown/30 text-vintage-brown hover:bg-vintage-brown hover:text-vintage-cream"
                  >
                    <Icon name="Settings" size={16} className="mr-2" />
                    Редактировать
                  </Button>
                )}
              </div>
              <p className="text-xl text-vintage-brown mb-2">@{artist.username}</p>
              {artist.bio && (
                <p className="text-vintage-brown/80 max-w-2xl">{artist.bio}</p>
              )}
              <div className="flex gap-2 mt-4">
                <Badge className="bg-vintage-warm text-vintage-cream">
                  {albums.length} {albums.length === 1 ? 'альбом' : 'альбомов'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {albums.length === 0 ? (
          <Card className="bg-vintage-cream/80 border-vintage-brown/30">
            <CardContent className="py-12 text-center">
              <Icon name="Disc" size={64} className="mx-auto mb-4 text-vintage-brown/40" />
              <p className="text-xl text-vintage-brown">У этого артиста пока нет альбомов</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Топ популярных треков */}
            {(() => {
              const allTracks = Object.values(tracks).flat();
              const topTracks = allTracks
                .filter(t => t.plays_count && t.plays_count > 0)
                .sort((a, b) => (b.plays_count || 0) - (a.plays_count || 0))
                .slice(0, 5);
              
              if (topTracks.length > 0) {
                return (
                  <Card className="bg-vintage-cream/80 border-vintage-brown/30">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <Icon name="TrendingUp" size={28} className="text-vintage-warm" />
                        <h2 className="text-2xl font-bold text-vintage-dark-brown">Популярные треки</h2>
                      </div>
                      <div className="space-y-3">
                        {topTracks.map((track, index) => (
                          <div
                            key={track.id}
                            className="flex items-center gap-4 p-4 bg-vintage-brown/5 rounded-lg hover:bg-vintage-brown/10 transition-colors"
                          >
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-vintage-warm text-vintage-cream font-bold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-vintage-dark-brown">{track.title}</p>
                              <div className="flex gap-3 items-center mt-1">
                                {track.genre && (
                                  <p className="text-xs text-vintage-warm">
                                    <Icon name="Music" size={12} className="inline mr-1" />
                                    {track.genre}
                                  </p>
                                )}
                                <p className="text-xs text-vintage-brown/70">
                                  <Icon name="Headphones" size={12} className="inline mr-1" />
                                  {track.plays_count} прослушиваний
                                </p>
                              </div>
                            </div>
                            {track.preview_url && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-vintage-brown/30"
                                onClick={() => playTrack(track)}
                              >
                                <Icon name="Play" size={16} />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              }
              return null;
            })()}
            
            {/* Альбомы */}
            {albums.map((album) => (
              <Card key={album.id} className="bg-vintage-cream/80 border-vintage-brown/30 overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid md:grid-cols-4 gap-6 p-6">
                    <div className="md:col-span-1">
                      {album.cover_url ? (
                        <img 
                          src={album.cover_url} 
                          alt={album.title}
                          className="w-full aspect-square object-cover rounded-lg shadow-lg"
                        />
                      ) : (
                        <div className="w-full aspect-square bg-vintage-brown/20 rounded-lg flex items-center justify-center">
                          <Icon name="Disc" size={64} className="text-vintage-brown/40" />
                        </div>
                      )}
                    </div>
                    
                    <div className="md:col-span-3">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h2 className="text-3xl font-bold text-vintage-dark-brown mb-2">{album.title}</h2>
                          <p className="text-vintage-brown">
                            {new Date(album.created_at).getFullYear()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-vintage-dark-brown">{album.price} ₽</p>
                          <Button 
                            className="mt-2 bg-vintage-warm hover:bg-vintage-brown text-vintage-cream"
                            onClick={() => setSelectedAlbum(selectedAlbum === album.id ? null : album.id)}
                          >
                            <Icon name="ShoppingCart" size={16} className="mr-2" />
                            Купить альбом
                          </Button>
                        </div>
                      </div>

                      {tracks[album.id] && tracks[album.id].length > 0 && (
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-vintage-brown mb-3">Треки:</h3>
                          {tracks[album.id].map((track, index) => (
                            <div 
                              key={track.id}
                              className="flex items-center justify-between p-3 bg-vintage-brown/10 rounded-lg hover:bg-vintage-brown/20 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-vintage-brown/60 font-mono w-6">{index + 1}</span>
                                <div>
                                  <p className="font-medium text-vintage-dark-brown">{track.title}</p>
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
                                    {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-vintage-dark-brown font-semibold">{track.price} ₽</span>
                                {track.preview_url && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-vintage-brown/30"
                                    onClick={() => playTrack(track)}
                                  >
                                    <Icon name="Play" size={16} />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  className="bg-vintage-warm hover:bg-vintage-brown text-vintage-cream"
                                >
                                  <Icon name="ShoppingCart" size={16} />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {currentTrack && currentTrack.preview_url && (
          <div className="fixed bottom-0 left-0 right-0 bg-vintage-dark-brown/95 backdrop-blur-sm border-t border-vintage-warm/30 p-4">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-vintage-cream hover:text-vintage-warm"
                  onClick={() => setCurrentTrack(null)}
                >
                  <Icon name="X" size={20} />
                </Button>
                <div>
                  <p className="font-medium text-vintage-cream">{currentTrack.title}</p>
                  <p className="text-sm text-vintage-cream/70">Сейчас играет</p>
                </div>
              </div>
              <audio 
                src={currentTrack.preview_url} 
                controls 
                autoPlay
                className="max-w-md"
              />
            </div>
          </div>
        )}
      </main>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-vintage-cream border-vintage-brown/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-vintage-dark-brown text-2xl">
              Редактировать профиль
            </DialogTitle>
          </DialogHeader>
          <ProfileEditForm
            initialData={{
              display_name: artist?.display_name || '',
              bio: artist?.bio || '',
              avatar_url: artist?.avatar_url || '',
              banner_url: artist?.banner_url || '',
            }}
            onSubmit={handleUpdateProfile}
            onCancel={() => setIsEditDialogOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Artist;