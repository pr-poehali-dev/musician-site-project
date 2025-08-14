import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Icon from '@/components/ui/icon';

interface CartItem {
  id: string;
  title: string;
  type: 'track' | 'album';
  price: number;
  quantity: number;
}

const Index = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const tracks = [
    { id: "1", title: "Vintage Dreams", duration: "3:42", file: "", price: 129 },
    { id: "2", title: "Golden Memories", duration: "4:15", file: "", price: 129 },
    { id: "3", title: "Sunset Boulevard", duration: "3:28", file: "", price: 129 },
    { id: "4", title: "Old Soul", duration: "4:03", file: "", price: 129 }
  ];

  const albums = [
    { 
      id: "album1", 
      title: "Винтажные Мелодии", 
      artist: "Vintage Soul",
      tracks: 12, 
      price: 899, 
      cover: "/img/d10a9c15-7d7f-41eb-b586-bff4324f107a.jpg",
      description: "Полный альбом атмосферной винтажной музыки"
    },
    { 
      id: "album2", 
      title: "Золотые Годы", 
      artist: "Vintage Soul",
      tracks: 10, 
      price: 749, 
      cover: "/img/d10a9c15-7d7f-41eb-b586-bff4324f107a.jpg",
      description: "Коллекция лучших ретро композиций" 
    }
  ];

  const concerts = [
    { date: "15 сентября", venue: "Клуб «Джаз Кафе»", city: "Москва" },
    { date: "22 октября", venue: "Арт-центр «Винил»", city: "СПб" },
    { date: "10 ноября", venue: "Ретро Холл", city: "Казань" }
  ];

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const addToCart = (item: { id: string; title: string; price: number }, type: 'track' | 'album') => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id 
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { 
        id: item.id, 
        title: item.title, 
        type, 
        price: item.price, 
        quantity: 1 
      }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const updateTime = () => setCurrentTime(audio.currentTime);
      const updateDuration = () => setDuration(audio.duration);
      
      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('loadedmetadata', updateDuration);
      
      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('loadedmetadata', updateDuration);
      };
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-vintage-cream via-vintage-brown to-vintage-dark-brown">
      {/* Навигация */}
      <nav className="sticky top-0 z-50 backdrop-blur-sm bg-vintage-cream/80 border-b border-vintage-brown/20">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-vintage-warm">MUSICIAN</h1>
            <div className="hidden md:flex space-x-8">
              <a href="#home" className="text-vintage-warm hover:text-vintage-dark-brown transition-colors">Главная</a>
              <a href="#music" className="text-vintage-warm hover:text-vintage-dark-brown transition-colors">Музыка</a>
              <a href="#shop" className="text-vintage-warm hover:text-vintage-dark-brown transition-colors">Магазин</a>
              <a href="#concerts" className="text-vintage-warm hover:text-vintage-dark-brown transition-colors">Концерты</a>
              <a href="#contact" className="text-vintage-warm hover:text-vintage-dark-brown transition-colors">Контакты</a>
            </div>
            <div className="flex items-center gap-4">
              <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" className="relative">
                    <Icon name="ShoppingCart" size={24} />
                    {getTotalItems() > 0 && (
                      <Badge className="absolute -top-2 -right-2 bg-vintage-dark-brown text-vintage-cream min-w-[20px] h-5 rounded-full flex items-center justify-center text-xs">
                        {getTotalItems()}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="bg-vintage-cream border-vintage-brown/20">
                  <SheetHeader>
                    <SheetTitle className="text-vintage-warm">Корзина</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    {cart.length === 0 ? (
                      <p className="text-vintage-warm/70 text-center py-8">Корзина пуста</p>
                    ) : (
                      <>
                        {cart.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-vintage-brown/10 rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-medium text-vintage-warm">{item.title}</h4>
                              <p className="text-sm text-vintage-warm/60 capitalize">{item.type}</p>
                              <p className="text-sm font-bold text-vintage-dark-brown">{item.price} ₽</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                <Icon name="Minus" size={16} />
                              </Button>
                              <span className="w-8 text-center text-vintage-warm">{item.quantity}</span>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Icon name="Plus" size={16} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => removeFromCart(item.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Icon name="X" size={16} />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <div className="border-t border-vintage-brown/20 pt-4">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-lg font-bold text-vintage-warm">Итого:</span>
                            <span className="text-lg font-bold text-vintage-dark-brown">{getTotalPrice()} ₽</span>
                          </div>
                          <Button className="w-full bg-vintage-dark-brown hover:bg-vintage-warm text-vintage-cream">
                            <Icon name="CreditCard" size={20} className="mr-2" />
                            Оформить заказ
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
              <Button variant="ghost" className="md:hidden">
                <Icon name="Menu" size={24} />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero секция */}
      <section id="home" className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-5xl md:text-7xl font-bold text-vintage-warm leading-tight">
                Винтажная<br />
                <span className="text-vintage-dark-brown">Музыка</span><br />
                Души
              </h2>
              <p className="text-xl text-vintage-warm/80 leading-relaxed">
                Погрузитесь в мир теплых мелодий и атмосферных звуков, 
                вдохновленных золотой эрой музыки
              </p>
              <div className="flex gap-4">
                <Button className="bg-vintage-dark-brown hover:bg-vintage-warm text-vintage-cream px-8 py-3">
                  <Icon name="Play" size={20} className="mr-2" />
                  Слушать
                </Button>
                <Button variant="outline" className="border-vintage-dark-brown text-vintage-dark-brown hover:bg-vintage-dark-brown hover:text-vintage-cream">
                  <Icon name="Download" size={20} className="mr-2" />
                  Скачать
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="/img/d10a9c15-7d7f-41eb-b586-bff4324f107a.jpg" 
                  alt="Музыкант в винтажном стиле" 
                  className="w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-vintage-warm/40 to-transparent"></div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-vintage-dark-brown rounded-full flex items-center justify-center shadow-xl">
                <Icon name="Music" size={32} className="text-vintage-cream" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Музыкальный плеер */}
      <section id="music" className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-vintage-warm mb-4">Музыка</h3>
            <p className="text-vintage-warm/70 text-lg">Коллекция авторских треков</p>
          </div>

          <Card className="bg-vintage-cream/95 border-vintage-brown/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-vintage-warm">
                <Icon name="Disc3" size={24} />
                Сейчас играет: {tracks[currentTrack].title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Плеер контролы */}
              <div className="flex items-center justify-center gap-4">
                <Button variant="ghost" size="sm">
                  <Icon name="SkipBack" size={20} className="text-vintage-dark-brown" />
                </Button>
                <Button 
                  onClick={togglePlay}
                  className="bg-vintage-dark-brown hover:bg-vintage-warm text-vintage-cream w-16 h-16 rounded-full"
                >
                  <Icon name={isPlaying ? "Pause" : "Play"} size={24} />
                </Button>
                <Button variant="ghost" size="sm">
                  <Icon name="SkipForward" size={20} className="text-vintage-dark-brown" />
                </Button>
              </div>

              {/* Прогресс бар */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-vintage-warm/70">
                  <span>{formatTime(currentTime)}</span>
                  <span>{tracks[currentTrack].duration}</span>
                </div>
                <div className="w-full bg-vintage-brown/20 rounded-full h-2">
                  <div 
                    className="bg-vintage-dark-brown h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Список треков */}
              <div className="space-y-3">
                {tracks.map((track, index) => (
                  <div 
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                      currentTrack === index 
                        ? 'bg-vintage-dark-brown/10 border border-vintage-dark-brown/20' 
                        : 'hover:bg-vintage-brown/10'
                    }`}
                    onClick={() => setCurrentTrack(index)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-vintage-dark-brown rounded-full flex items-center justify-center">
                        <Icon name="Music" size={16} className="text-vintage-cream" />
                      </div>
                      <div>
                        <p className="font-medium text-vintage-warm">{track.title}</p>
                        <p className="text-sm text-vintage-warm/60">{track.duration}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Icon name="Play" size={16} className="text-vintage-dark-brown" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <audio ref={audioRef} />
        </div>
      </section>

      {/* Магазин */}
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

      {/* Концерты */}
      <section id="concerts" className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-vintage-warm mb-4">Концерты</h3>
            <p className="text-vintage-warm/70 text-lg">Ближайшие выступления</p>
          </div>

          <div className="grid gap-6">
            {concerts.map((concert, index) => (
              <Card key={index} className="bg-vintage-cream/95 border-vintage-brown/20 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-vintage-brown to-vintage-dark-brown rounded-full flex items-center justify-center">
                        <Icon name="Calendar" size={24} className="text-vintage-cream" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-vintage-warm">{concert.date}</h4>
                        <p className="text-vintage-warm/80">{concert.venue}</p>
                        <p className="text-sm text-vintage-warm/60">{concert.city}</p>
                      </div>
                    </div>
                    <Button className="bg-vintage-dark-brown hover:bg-vintage-warm text-vintage-cream">
                      Билеты
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Контакты */}
      <section id="contact" className="py-16 px-6 bg-vintage-warm/5">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl font-bold text-vintage-warm mb-8">Контакты</h3>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="bg-vintage-cream/95 border-vintage-brown/20">
              <CardContent className="p-6 text-center">
                <Icon name="Mail" size={32} className="mx-auto mb-4 text-vintage-dark-brown" />
                <h4 className="font-bold text-vintage-warm mb-2">Email</h4>
                <p className="text-vintage-warm/70">music@vintage.ru</p>
              </CardContent>
            </Card>

            <Card className="bg-vintage-cream/95 border-vintage-brown/20">
              <CardContent className="p-6 text-center">
                <Icon name="Phone" size={32} className="mx-auto mb-4 text-vintage-dark-brown" />
                <h4 className="font-bold text-vintage-warm mb-2">Телефон</h4>
                <p className="text-vintage-warm/70">+7 (999) 123-45-67</p>
              </CardContent>
            </Card>

            <Card className="bg-vintage-cream/95 border-vintage-brown/20">
              <CardContent className="p-6 text-center">
                <Icon name="Instagram" size={32} className="mx-auto mb-4 text-vintage-dark-brown" />
                <h4 className="font-bold text-vintage-warm mb-2">Соцсети</h4>
                <p className="text-vintage-warm/70">@vintage_music</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center gap-6">
            <Button variant="outline" size="lg" className="border-vintage-dark-brown text-vintage-dark-brown hover:bg-vintage-dark-brown hover:text-vintage-cream">
              <Icon name="Youtube" size={20} className="mr-2" />
              YouTube
            </Button>
            <Button variant="outline" size="lg" className="border-vintage-dark-brown text-vintage-dark-brown hover:bg-vintage-dark-brown hover:text-vintage-cream">
              <Icon name="Music" size={20} className="mr-2" />
              Spotify
            </Button>
          </div>
        </div>
      </section>

      {/* Футер */}
      <footer className="bg-vintage-warm text-vintage-cream py-8 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="mb-4">&copy; 2024 Vintage Music. Все права защищены.</p>
          <p className="text-vintage-cream/70">Создано с любовью к музыке</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;