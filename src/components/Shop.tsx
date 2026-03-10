import React, { useState, useEffect } from 'react';
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
}

const Shop: React.FC<ShopProps> = ({
  albums: initialAlbums,
  tracks: initialTracks,
  currentTrack,
  setCurrentTrack,
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

      {selectedAlbum && (
        <AlbumView
          album={selectedAlbum}
          onClose={handleCloseAlbum}
        />
      )}
    </>
  );
};

export default Shop;
