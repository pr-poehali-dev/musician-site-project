import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from '@/components/ui/icon';
import AlbumView from '@/components/AlbumView';
import AlbumGrid from '@/components/AlbumGrid';
import TopTracks from '@/components/TopTracks';
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

  useEffect(() => {
    setAlbums(initialAlbums);
  }, [initialAlbums]);

  useEffect(() => {
    setTracks(initialTracks);
  }, [initialTracks]);

  const [albums, setAlbums] = useState<Album[]>(initialAlbums);
  const [tracks, setTracks] = useState<Track[]>(initialTracks);

  const handleAddToCart = (item: { id: string; title: string; type: 'track' | 'album'; price: number; quantity: number }) => {
    console.log('🛍️ Shop получил запрос добавить в корзину:', item);
    
    let fullItem;
    if (item.type === 'album') {
      fullItem = albums.find(a => a.id === item.id);
    } else {
      for (const album of albums) {
        const track = album.trackList?.find(t => t.id === item.id);
        if (track) {
          fullItem = track;
          break;
        }
      }
    }
    
    console.log('🔍 Найденный элемент:', fullItem);
    if (fullItem) {
      console.log('➡️ Отправляем в addToCart:', fullItem, item.type);
      addToCart(fullItem, item.type);
    } else {
      console.warn('⚠️ Элемент не найден в albums/tracks!');
    }
  };

  const handleAlbumClick = (album: Album) => {
    setSelectedAlbum(album);
  };

  const handleAlbumClickById = (albumId: string) => {
    const album = albums.find(a => a.id === albumId);
    if (album) {
      setSelectedAlbum(album);
    }
  };

  const handleCloseAlbum = () => {
    setSelectedAlbum(null);
  };

  return (
    <>
      <section id="shop" className="py-16 px-6 bg-vintage-warm/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-8 items-start">
            <div className="flex-1">
              <AlbumGrid
                albums={albums}
                onAlbumClick={handleAlbumClick}
                onAddToCart={handleAddToCart}
              />
            </div>
            
            <div className="w-96 flex-shrink-0 sticky top-24">
              <TopTracks 
                limit={5} 
                onTrackClick={handleAlbumClickById}
              />
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