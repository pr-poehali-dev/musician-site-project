import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from '@/components/ui/icon';
import { Track, Album } from '@/types';

interface ShopProps {
  albums: Album[];
  tracks: Track[];
  currentTrack: number;
  setCurrentTrack: (track: number) => void;
  addToCart: (item: Track | Album, type: 'track' | 'album') => void;
}

const Shop: React.FC<ShopProps> = ({
  albums,
  tracks,
  currentTrack,
  setCurrentTrack,
  addToCart
}) => {
  return (
    <section id="shop" className="py-16 px-6 bg-vintage-warm/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-bold text-vintage-warm mb-4">Магазин</h3>
          <p className="text-vintage-warm/70 text-lg">Приобретите треки и альбомы</p>
        </div>

        {/* Альбомы */}
        <div className="mb-16">
          <h4 className="text-2xl font-bold text-vintage-warm mb-8">Альбомы</h4>
          <div className="grid md:grid-cols-2 gap-8">
            {albums.map((album) => (
              <Card key={album.id} className="bg-vintage-cream/95 border-vintage-brown/20 hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="relative">
                      <img 
                        src={album.cover} 
                        alt={album.title}
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-vintage-dark-brown text-vintage-cream">
                          {album.tracks} треков
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h5 className="text-xl font-bold text-vintage-warm mb-1">{album.title}</h5>
                        <p className="text-vintage-warm/70">{album.artist}</p>
                        <p className="text-sm text-vintage-warm/60 mt-2">{album.description}</p>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-vintage-dark-brown">{album.price} ₽</span>
                          <Button 
                            onClick={() => addToCart(album, 'album')}
                            className="bg-vintage-dark-brown hover:bg-vintage-warm text-vintage-cream"
                          >
                            <Icon name="ShoppingCart" size={16} className="mr-2" />
                            Купить
                          </Button>
                        </div>
                        <Button 
                          variant="outline"
                          className="w-full border-vintage-dark-brown text-vintage-dark-brown hover:bg-vintage-dark-brown hover:text-vintage-cream"
                        >
                          <Icon name="Play" size={16} className="mr-2" />
                          Прослушать
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Отдельные треки */}
        <div>
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
  );
};

export default Shop;