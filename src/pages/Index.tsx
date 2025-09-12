import { useState } from 'react';
import Header from '@/components/Header';
import MusicPlayer from '@/components/MusicPlayer';
import TrackList from '@/components/TrackList';
import Shop from '@/components/Shop';
import ConcertsSection from '@/components/ConcertsSection';
import AdminLogin from '@/components/AdminLogin';
import { CartItem, Track, Album } from '@/types';

const Index = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const [tracks, setTracks] = useState<Track[]>([
    { id: "1", title: "Vintage Dreams", duration: "3:42", file: "", price: 129 },
    { id: "2", title: "Golden Memories", duration: "4:15", file: "", price: 129 },
    { id: "3", title: "Sunset Boulevard", duration: "3:28", file: "", price: 129 },
    { id: "4", title: "Old Soul", duration: "4:03", file: "", price: 129 }
  ]);

  const [albums, setAlbums] = useState<Album[]>([
    { 
      id: "album1", 
      title: "Винтажные Мелодии", 
      artist: "Vintage Soul",
      tracks: 4, 
      price: 899, 
      cover: "/img/d10a9c15-7d7f-41eb-b586-bff4324f107a.jpg",
      description: "Полный альбом атмосферной винтажной музыки",
      trackList: [
        { id: "1", title: "Vintage Dreams", duration: "3:42", file: "", price: 129 },
        { id: "2", title: "Golden Memories", duration: "4:15", file: "", price: 129 },
        { id: "3", title: "Sunset Boulevard", duration: "3:28", file: "", price: 129 },
        { id: "4", title: "Old Soul", duration: "4:03", file: "", price: 129 }
      ]
    },
    { 
      id: "album2", 
      title: "Золотые Годы", 
      artist: "Vintage Soul",
      tracks: 3, 
      price: 749, 
      cover: "/img/d10a9c15-7d7f-41eb-b586-bff4324f107a.jpg",
      description: "Коллекция лучших ретро композиций",
      trackList: [
        { id: "5", title: "Jazz Cafe Nights", duration: "5:12", file: "", price: 149 },
        { id: "6", title: "Midnight Train", duration: "4:33", file: "", price: 149 },
        { id: "7", title: "Blue Moon Rising", duration: "3:55", file: "", price: 149 }
      ]
    }
  ]);

  const concerts = [
    { date: "15 сентября", venue: "Клуб «Джаз Кафе»", city: "Москва" },
    { date: "22 октября", venue: "Арт-центр «Винил»", city: "СПб" },
    { date: "10 ноября", venue: "Ретро Холл", city: "Казань" }
  ];

  const addToCart = (item: Track | Album, type: 'track' | 'album') => {
    const cartItem: CartItem = {
      id: item.id,
      title: item.title,
      type,
      price: item.price,
      quantity: 1
    };

    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, cartItem];
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

  const handleAdminLogin = () => {
    if (adminPassword === 'admin123') {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setShowAdminPanel(true);
      setAdminPassword('');
    } else {
      alert('Неверный пароль');
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setShowAdminPanel(false);
  };

  const addNewAlbum = (albumData: Omit<Album, 'id'>) => {
    const newAlbum: Album = {
      ...albumData,
      id: Date.now().toString()
    };
    setAlbums([...albums, newAlbum]);
  };

  const addTrackToAlbum = (albumId: string, trackData: Omit<Track, 'id'>) => {
    const newTrack: Track = {
      ...trackData,
      id: Date.now().toString()
    };
    
    setAlbums(albums.map(album => 
      album.id === albumId 
        ? { 
            ...album, 
            trackList: [...album.trackList, newTrack],
            tracks: album.trackList.length + 1
          } 
        : album
    ));
    
    setTracks([...tracks, newTrack]);
    
    // Обновляем localStorage и генерируем событие
    const savedTracks = localStorage.getItem('uploadedTracks');
    let uploadedTracks = [];
    if (savedTracks) {
      uploadedTracks = JSON.parse(savedTracks);
    }
    uploadedTracks.push(newTrack);
    localStorage.setItem('uploadedTracks', JSON.stringify(uploadedTracks));
    window.dispatchEvent(new CustomEvent('tracksUpdated'));
  };

  const handleTrackSelect = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const removeTrack = (trackId: string) => {
    setTracks(tracks.filter(track => track.id !== trackId));
    
    setAlbums(albums.map(album => ({
      ...album,
      trackList: album.trackList.filter(track => track.id !== trackId),
      tracks: album.trackList.filter(track => track.id !== trackId).length
    })));
  };

  const editAlbum = (albumId: string, albumData: Omit<Album, 'id'>) => {
    setAlbums(albums.map(album => 
      album.id === albumId 
        ? { ...album, ...albumData } 
        : album
    ));
  };

  const removeAlbum = (albumId: string) => {
    const albumTracks = albums.find(album => album.id === albumId)?.trackList || [];
    
    setAlbums(albums.filter(album => album.id !== albumId));
    
    setTracks(tracks.filter(track => 
      !albumTracks.some(albumTrack => albumTrack.id === track.id)
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-vintage-cream via-vintage-brown to-vintage-dark-brown">
      {/* Навигация */}
      <Header
        cart={cart}
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        showAdminLogin={showAdminLogin}
        setShowAdminLogin={setShowAdminLogin}
        adminPassword={adminPassword}
        setAdminPassword={setAdminPassword}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        getTotalPrice={getTotalPrice}
        getTotalItems={getTotalItems}
        handleAdminLogin={handleAdminLogin}
      />

      {/* Герой секция */}
      <section id="home" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Текст */}
            <div className="text-center md:text-left">
              <h2 className="font-bold tracking-tight my-3 text-5xl text-[#ce8dba]">Слова в нотах - от сердца к клавишам</h2>
              <p className="text-xl mb-8 leading-relaxed text-[#a47017f5]">Официальный сайт Дмитрия Шмелидзэ</p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <button 
                  onClick={() => {
                    const shopSection = document.getElementById('shop');
                    shopSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-vintage-warm hover:bg-vintage-cream text-vintage-dark-brown px-8 py-3 rounded-full font-semibold transition-all transform hover:scale-105"
                >
                  Послушать
                </button>
                <button className="">
                  О музыканте
                </button>
              </div>
            </div>
            
            {/* Фотография музыканта */}
            <div className="flex justify-center">
              <div className="relative">
                <img 
                  src="/img/7fa09eda-4272-4772-b123-f46dd3566acd.jpg" 
                  alt="Дмитрий Шмелидзэ - музыкант"
                  className="w-80 h-80 object-cover rounded-full shadow-2xl border-4 border-vintage-warm/30"
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-vintage-warm/10 to-vintage-dark-brown/20"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Список загруженных треков */}
      <TrackList
        onTrackSelect={handleTrackSelect}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
      />

      {/* Музыкальный плеер */}
      <MusicPlayer
        tracks={tracks}
        isPlaying={isPlaying}
        currentTrack={currentTrack}
        currentTime={currentTime}
        duration={duration}
        setIsPlaying={setIsPlaying}
        setCurrentTrack={setCurrentTrack}
        setCurrentTime={setCurrentTime}
        setDuration={setDuration}
      />

      {/* Магазин */}
      <Shop
        albums={albums}
        tracks={tracks}
        currentTrack={currentTrack ? tracks.findIndex(track => track.id === currentTrack.id) : 0}
        setCurrentTrack={(index: number) => setCurrentTrack(tracks[index])}
        addToCart={addToCart}
      />

      {/* Концерты */}
      <ConcertsSection concerts={concerts} />

      {/* Контакты */}
      <section id="contact" className="py-16 px-6 bg-vintage-dark-brown">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl font-bold text-vintage-cream mb-8">Контакты</h3>
          <div className="grid md:grid-cols-3 gap-8 text-vintage-cream/80">
            <div>
              <h4 className="text-xl font-semibold mb-2 text-vintage-warm">Email</h4>
              <p>vintage.soul@music.com</p>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-2 text-vintage-warm">Телефон</h4>
              <p>+7 (999) 123-45-67</p>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-2 text-vintage-warm">Социальные сети</h4>
              <p>@vintage_soul_music</p>
            </div>
          </div>
        </div>
      </section>

      {/* Админ панель */}
      <AdminLogin
        isAdmin={isAdmin}
        showAdminPanel={showAdminPanel}
        setShowAdminPanel={setShowAdminPanel}
        albums={albums}
        tracks={tracks}
        handleAdminLogout={handleAdminLogout}
        addNewAlbum={addNewAlbum}
        editAlbum={editAlbum}
        removeAlbum={removeAlbum}
        addTrackToAlbum={addTrackToAlbum}
        removeTrack={removeTrack}
      />

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