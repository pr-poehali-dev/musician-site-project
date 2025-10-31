import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

interface Artist {
  username: string;
  display_name: string;
  avatar_url?: string;
  banner_url?: string;
  bio?: string;
}

interface ArtistProfileProps {
  artist: Artist;
  isOwnProfile: boolean;
  onEditClick: () => void;
}

const ArtistProfile = ({ artist, isOwnProfile, onEditClick }: ArtistProfileProps) => {
  return (
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
                className="border-vintage-warm text-vintage-warm hover:bg-vintage-warm hover:text-vintage-cream"
                onClick={onEditClick}
              >
                <Icon name="Edit" size={16} className="mr-2" />
                Редактировать профиль
              </Button>
            )}
          </div>
          <Badge variant="outline" className="text-vintage-brown border-vintage-brown/30">
            @{artist.username}
          </Badge>
          {artist.bio && (
            <p className="mt-4 text-vintage-brown text-lg">{artist.bio}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtistProfile;
