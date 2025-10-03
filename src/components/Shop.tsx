import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from '@/components/ui/icon';
import AlbumView from '@/components/AlbumView';
import AlbumGrid from '@/components/AlbumGrid';
import { Track, Album } from '@/types';

interface ShopProps {
  albums: Album[];
  tracks: Track[];
  currentTrack: number;
  setCurrentTrack: (track: number) => void;
  addToCart: (item: Track | Album, type: 'track' | 'album') => void;
}

const Shop: React.FC<ShopProps> = ({
  albums: initialAlbums,
  tracks: initialTracks,
  currentTrack,
  setCurrentTrack,
  addToCart
}) => {
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [albums, setAlbums] = useState<Album[]>(initialAlbums);
  const [tracks, setTracks] = useState<Track[]>(initialTracks);

  useEffect(() => {
    const loadAlbums = () => {
      const savedAlbums = localStorage.getItem('albums');
      if (savedAlbums) {
        setAlbums(JSON.parse(savedAlbums));
      } else {
        setAlbums(initialAlbums);
      }
    };

    const loadTracks = () => {
      const savedTracks = localStorage.getItem('uploadedTracks');
      if (savedTracks) {
        setTracks(JSON.parse(savedTracks));
      } else {
        setTracks(initialTracks);
      }
    };

    loadAlbums();
    loadTracks();

    const handleAlbumsUpdate = () => loadAlbums();
    const handleTracksUpdate = () => loadTracks();

    window.addEventListener('albumsUpdated', handleAlbumsUpdate);
    window.addEventListener('tracksUpdated', handleTracksUpdate);

    return () => {
      window.removeEventListener('albumsUpdated', handleAlbumsUpdate);
      window.removeEventListener('tracksUpdated', handleTracksUpdate);
    };
  }, [initialAlbums, initialTracks]);

  const handleAddToCart = (item: { id: string; title: string; type: 'track' | 'album'; price: number; quantity: number }) => {
    const fullItem = item.type === 'album' 
      ? albums.find(a => a.id === item.id) 
      : tracks.find(t => t.id === item.id);
    
    if (fullItem) {
      addToCart(fullItem, item.type);
    }
  };

  const handleAlbumClick = (album: Album) => {
    setSelectedAlbum(album);
  };

  const handleCloseAlbum = () => {
    setSelectedAlbum(null);
  };

  return (
    <>
      <section id="shop" className="py-16 px-6 bg-vintage-warm/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-vintage-warm mb-4">Магазин</h3>
            <p className="text-vintage-warm/70 text-lg">Приобретите треки и альбомы</p>
          </div>

          {/* Альбомы */}
          <AlbumGrid
            albums={albums}
            onAlbumClick={handleAlbumClick}
            onAddToCart={handleAddToCart}
          />

          {/* Отдельные треки */}
          <div className="mt-16">
            <h4 className="text-2xl font-bold text-vintage-warm mb-8">Отдельные треки</h4>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {tracks.map((track) => (
                <Card key={track.id} className="bg-vintage-cream/95 border-vintage-brown/20 hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="w-full aspect-square bg-gradient-to-br from-vintage-brown to-vintage-dark-brown rounded-lg flex items-center justify-center">
                        <Icon name="Music" size={32} className="text-vintage-cream" />
                      </div>
                      <div>
                        <h5 className="font-bold text-vintage-warm mb-1">{track.title}</h5>
                        <p className="text-sm text-vintage-warm/60">{track.duration}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-vintage-dark-brown">{track.price} ₽</span>
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => setCurrentTrack(tracks.indexOf(track))}
                            className="border-vintage-brown text-vintage-dark-brown hover:bg-vintage-brown hover:text-vintage-cream"
                          >
                            <Icon name="Play" size={12} />
                          </Button>
                        </div>
                        <Button 
                          onClick={() => addToCart(track, 'track')}
                          className="w-full bg-vintage-dark-brown hover:bg-vintage-warm text-vintage-cream"
                          size="sm"
                        >
                          <Icon name="ShoppingCart" size={14} className="mr-1" />
                          Купить
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Модальное окно альбома */}
      {selectedAlbum && (
        <AlbumView
          album={selectedAlbum}
          onClose={handleCloseAlbum}
          onAddToCart={handleAddToCart}
        />
      )}
    </>
  );
};

export default Shop;