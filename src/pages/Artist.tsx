import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import ProfileEditForm, { ProfileFormData } from '@/components/ProfileEditForm';
import ArtistHeader from '@/components/artist/ArtistHeader';
import ArtistProfile from '@/components/artist/ArtistProfile';
import AlbumCard from '@/components/artist/AlbumCard';
import TrackList from '@/components/artist/TrackList';
import AudioPlayer from '@/components/artist/AudioPlayer';

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

        const tracksPromises = albumsData.map((album: Album) =>
          fetch(`${USER_MUSIC_API}?path=tracks&album_id=${album.id}`)
            .then(response => response.ok ? response.json() : [])
            .then(tracksData => ({ albumId: album.id, tracks: tracksData }))
            .catch(() => ({ albumId: album.id, tracks: [] }))
        );

        const tracksResults = await Promise.all(tracksPromises);
        
        const tracksMap: { [albumId: number]: Track[] } = {};
        tracksResults.forEach(result => {
          tracksMap[result.albumId] = result.tracks;
        });
        
        setTracks(tracksMap);
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
    
    try {
      await fetch(`${USER_MUSIC_API}?path=track-play`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ track_id: track.id }),
      });
      
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
      <ArtistHeader 
        user={user}
        onDashboardClick={() => navigate('/dashboard')}
        onAuthClick={() => navigate('/auth')}
      />

      <main className="max-w-6xl mx-auto p-6">
        <ArtistProfile 
          artist={artist}
          isOwnProfile={isOwnProfile}
          onEditClick={() => setIsEditDialogOpen(true)}
        />

        {albums.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-vintage-brown text-lg">
              {isOwnProfile 
                ? 'У вас пока нет альбомов. Создайте первый альбом в панели управления!' 
                : 'У этого артиста пока нет альбомов'}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {albums.map((album) => (
                <AlbumCard
                  key={album.id}
                  album={album}
                  isSelected={selectedAlbum === album.id}
                  trackCount={tracks[album.id]?.length || 0}
                  onSelect={() => setSelectedAlbum(selectedAlbum === album.id ? null : album.id)}
                />
              ))}
            </div>

            {selectedAlbum && tracks[selectedAlbum] && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-vintage-dark-brown mb-6">
                  Треки альбома
                </h2>
                <TrackList 
                  tracks={tracks[selectedAlbum]}
                  currentTrack={currentTrack}
                  onPlayTrack={playTrack}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {currentTrack && currentTrack.preview_url && (
        <AudioPlayer 
          track={currentTrack}
          onClose={() => setCurrentTrack(null)}
        />
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-vintage-cream border-vintage-warm">
          <DialogHeader>
            <DialogTitle className="text-vintage-dark-brown text-2xl">
              Редактировать профиль
            </DialogTitle>
          </DialogHeader>
          <ProfileEditForm 
            onSubmit={handleUpdateProfile}
            isSubmitting={isSubmitting}
            initialData={{
              display_name: artist.display_name,
              bio: artist.bio || '',
              avatar_url: artist.avatar_url || '',
              banner_url: artist.banner_url || '',
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Artist;