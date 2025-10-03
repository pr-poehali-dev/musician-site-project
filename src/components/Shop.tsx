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
          {/* Альбомы */}
          <AlbumGrid
            albums={albums}
            onAlbumClick={handleAlbumClick}
            onAddToCart={handleAddToCart}
          />
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