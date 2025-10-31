import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

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

interface AlbumCardProps {
  album: Album;
  isSelected: boolean;
  trackCount: number;
  onSelect: () => void;
}

const AlbumCard = ({ album, isSelected, trackCount, onSelect }: AlbumCardProps) => {
  return (
    <Card 
      className={`overflow-hidden cursor-pointer transition-all hover:shadow-xl ${
        isSelected ? 'ring-2 ring-vintage-warm shadow-xl' : ''
      }`}
      onClick={onSelect}
    >
      <div className="aspect-square relative bg-vintage-brown/20">
        {album.cover_url ? (
          <img 
            src={album.cover_url} 
            alt={album.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon name="Music" size={64} className="text-vintage-warm/40" />
          </div>
        )}
      </div>
      <CardContent className="p-4 bg-vintage-cream/90">
        <h3 className="font-bold text-vintage-dark-brown text-lg mb-1 truncate">
          {album.title}
        </h3>
        <p className="text-sm text-vintage-brown mb-2">
          {trackCount} {trackCount === 1 ? 'трек' : trackCount < 5 ? 'трека' : 'треков'}
        </p>
        {album.price > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-vintage-warm font-bold">{album.price} ₽</span>
            <Button 
              size="sm" 
              className="ml-auto bg-vintage-warm hover:bg-vintage-brown text-vintage-cream"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Icon name="ShoppingCart" size={14} className="mr-1" />
              Купить
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlbumCard;
