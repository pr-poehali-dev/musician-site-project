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
import { useToast } from '@/hooks/use-toast';

const MusicPage = () => {
  const { toast } = useToast();
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
        toast({
          title: "Обновлено",
          description: `"${item.title}" уже в корзине. Количество увеличено.`,
          duration: 2000,
        });
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      console.log('➕ Добавляем новый товар в корзину');
      toast({
        title: "Добавлено в корзину",
        description: `${type === 'album' ? 'Альбом' : 'Трек'} "${item.title}" добавлен в корзину`,
        duration: 2000,
      });
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

  const handleAdminLogin = async () => {
    try {
      const API_URL = 'https://functions.poehali.dev/d77ee4d0-ba39-4a98-a764-c8f09e40bc53';
      
      const response = await fetch(`${API_URL}?path=login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: adminPassword })
      });

      if (!response.ok) {
        throw new Error('Неверный пароль');
      }

      const data = await response.json();
      
      // Сохраняем токен в localStorage
      localStorage.setItem('authToken', data.token);
      
      setIsAdmin(true);
      setShowAdminLogin(false);
      setShowAdminPanel(true);
      setAdminPassword('');
      
      toast({
        title: "Добро пожаловать!",
        description: "Вы вошли в админ-панель",
        duration: 2000,
      });
    } catch (error) {
      console.error('❌ Ошибка авторизации:', error);
      toast({
        title: "Ошибка входа",
        description: (error as Error).message,
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleAdminLogout = () => {
    // Удаляем токен из localStorage
    localStorage.removeItem('authToken');
    setIsAdmin(false);
    setShowAdminPanel(false);
    
    toast({
      title: "До встречи!",
      description: "Вы вышли из админ-панели",
      duration: 2000,
    });
  };

  const handleTrackSelect = (track: Track) => {
    setCurrentTrack(track);
  };

  const handleCheckout = async (data: { name: string; telegram: string; email?: string }) => {
    try {
      const API_URL = 'https://functions.poehali.dev/25aac639-cf81-4eb7-80fc-aa9a157a25e6';
      
      const orderData = {
        name: data.name,
        telegram: data.telegram.replace('@', ''),
        email: data.email,
        items: cart.map(item => ({
          id: item.id,
          title: item.title,
          type: item.type,
          price: item.price,
          quantity: item.quantity
        })),
        total: getTotalPrice()
      };

      const response = await fetch(`${API_URL}?path=order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error('Ошибка создания заказа');
      }

      const result = await response.json();
      
      toast({
        title: "Заказ оформлен!",
        description: `Номер заказа: ${result.order_id}. Проверьте Telegram для деталей.`,
        duration: 5000,
      });

      console.log('✅ Заказ создан:', result);
    } catch (error) {
      console.error('❌ Ошибка оформления заказа:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось оформить заказ. Попробуйте снова.",
        variant: "destructive",
        duration: 3000,
      });
      throw error;
    }
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
        onCheckout={handleCheckout}
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