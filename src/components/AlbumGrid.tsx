import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from '@/components/ui/icon';
import { Album } from '@/types';

interface AlbumGridProps {
  albums: Album[];
  onAlbumClick: (album: Album) => void;
  onAddToCart: (item: { id: string; title: string; type: 'album'; price: number; quantity: number }) => void;
}

const AlbumCard = React.memo<{
  album: Album;
  onAlbumClick: (album: Album) => void;
  onAddToCart: (album: Album, e: React.MouseEvent) => void;
}>(({ album, onAlbumClick, onAddToCart }) => {
  const [coverLoaded, setCoverLoaded] = useState(false);
  const [coverError, setCoverError] = useState(false);
  const handleClick = useCallback(() => onAlbumClick(album), [onAlbumClick, album]);
  const handleAddToCart = useCallback((e: React.MouseEvent) => onAddToCart(album, e), [onAddToCart, album]);

  const validCover = album.cover && album.cover.startsWith('data:') ? album.cover : '';

  return (
    <Card
      className="bg-vintage-cream/95 backdrop-blur-sm border-vintage-brown/20 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
      onClick={handleClick}
    >
      <CardContent className="p-0">
        <div className="relative overflow-hidden bg-vintage-brown/20">
          {validCover && !coverError ? (
            <>
              {!coverLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon name="Music" size={32} className="text-vintage-warm/40 animate-pulse" />
                </div>
              )}
              <img
                src={validCover}
                alt={album.title}
                className="w-full h-40 sm:h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                onLoad={() => setCoverLoaded(true)}
                onError={() => setCoverError(true)}
                style={{ opacity: coverLoaded ? 1 : 0 }}
              />
            </>
          ) : (
            <div className="w-full h-40 sm:h-48 flex items-center justify-center bg-gradient-to-br from-vintage-warm/30 to-vintage-brown/30">
              <Icon name="Music" size={48} className="text-vintage-warm/60" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
            <Button
              variant="ghost"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-vintage-cream/80 text-vintage-dark-brown hover:bg-vintage-cream"
            >
              <Icon name="Play" size={24} />
            </Button>
          </div>
        </div>
        
        <div className="p-3 sm:p-4">
          <h4 className="font-bold text-vintage-warm text-base sm:text-lg mb-1 line-clamp-1">
            {album.title}
          </h4>
          <p className="text-vintage-warm/70 text-xs sm:text-sm mb-2 line-clamp-1">
            {album.artist}
          </p>
          <p className="text-vintage-warm/60 text-xs sm:text-sm mb-3 line-clamp-2 hidden sm:block">
            {album.description}
          </p>
          
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold text-vintage-dark-brown">
                {album.price} ₽
              </span>
              <span className="text-xs text-vintage-warm/60">
                {album.trackList?.length || album.tracks || 0} {(album.trackList?.length || album.tracks || 0) === 1 ? 'трек' : 'треков'}
              </span>
            </div>
            
            <Button
              onClick={handleAddToCart}
              className="bg-vintage-dark-brown hover:bg-vintage-warm text-vintage-cream text-xs sm:text-sm"
              size="sm"
            >
              <Icon name="ShoppingCart" size={14} className="sm:mr-1" />
              <span className="hidden sm:inline">В корзину</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

AlbumCard.displayName = 'AlbumCard';

const AlbumGrid: React.FC<AlbumGridProps> = ({
  albums: initialAlbums,
  onAlbumClick,
  onAddToCart
}) => {
  const [albums, setAlbums] = useState<Album[]>(initialAlbums);

  useEffect(() => {
    setAlbums(initialAlbums);
  }, [initialAlbums]);

  useEffect(() => {
    const loadAlbums = () => {
      const savedAlbums = localStorage.getItem('albums');
      if (savedAlbums) {
        setAlbums(JSON.parse(savedAlbums));
      }
    };

    window.addEventListener('albumsUpdated', loadAlbums);
    return () => window.removeEventListener('albumsUpdated', loadAlbums);
  }, []);

  const handleAddToCart = useCallback((album: Album, e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart({
      id: album.id,
      title: album.title,
      type: 'album',
      price: album.price,
      quantity: 1
    });
  }, [onAddToCart]);

  return (
    <section id="albums" className="py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-bold text-vintage-warm mb-4">Альбомы</h3>
          <p className="text-vintage-warm/70 text-lg">Выберите альбом для прослушивания треков</p>
        </div>

        <div className="bg-vintage-warm/10 border border-vintage-brown/20 rounded-lg p-4 mb-8 max-w-3xl mx-auto">
          <p className="text-vintage-dark-brown text-center font-medium px-[65px]">Для прослушивания трека в хорошем качестве добавьте трек в корзину. 
Скачивая треки в хорошем качестве, вы поддерживаете автора</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {albums.map((album) => (
            <AlbumCard
              key={album.id}
              album={album}
              onAlbumClick={onAlbumClick}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default React.memo(AlbumGrid);