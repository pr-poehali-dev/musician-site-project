import { useState } from 'react';
import Header from '@/components/Header';
import Shop from '@/components/Shop';
import ContactSection from '@/components/music/ContactSection';
import Footer from '@/components/music/Footer';
import AdminLogin from '@/components/AdminLogin';
import SyncIndicator from '@/components/SyncIndicator';
import { CartItem, Track } from '@/types';
import { useAlbumManagement } from '@/hooks/useAlbumManagement';
import { useTrackManagement } from '@/hooks/useTrackManagement';

const MusicPage = () => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const {
    albums,
    setAlbums,
    addNewAlbum,
    editAlbum,
    removeAlbum,
    addTrackToAlbum,
    moveTrack
  } = useAlbumManagement();

  const {
    tracks,
    removeTrack,
    editTrack,
    isOnline,
    lastSyncTime
  } = useTrackManagement(albums, setAlbums);

  const addToCart = (item: Track | { id: string; title: string; price: number }, type: 'track' | 'album') => {
    console.log('🎯 MusicPage.addToCart вызван:', item, 'type:', type);
    const cartItem: CartItem = {
      id: item.id,
      title: item.title,
      type,
      price: item.price,
      quantity: 1
    };

    console.log('📦 Создан cartItem:', cartItem);
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        console.log('✨ Увеличиваем количество существующего товара');
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      console.log('➕ Добавляем новый товар в корзину');
      return [...prevCart, cartItem];
    });
    console.log('✅ Корзина обновлена');
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

  const handleTrackSelect = (track: Track) => {
    setCurrentTrack(track);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-vintage-cream via-vintage-brown to-vintage-dark-brown">
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

      <Shop
        albums={albums}
        tracks={tracks}
        currentTrack={currentTrack ? tracks.findIndex(track => track.id === currentTrack.id) : 0}
        setCurrentTrack={(index: number) => setCurrentTrack(tracks[index])}
        addToCart={addToCart}
      />

      <ContactSection />

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
        editTrack={editTrack}
        moveTrack={moveTrack}
      />

      <Footer />

      <SyncIndicator 
        isOnline={isOnline} 
        lastSyncTime={lastSyncTime} 
      />
    </div>
  );
};

export default MusicPage;