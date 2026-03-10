import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Shop from '@/components/Shop';
import ContactSection from '@/components/music/ContactSection';
import Footer from '@/components/music/Footer';
import AdminLogin from '@/components/AdminLogin';
import SyncIndicator from '@/components/SyncIndicator';
import { Track } from '@/types';
import { useAlbumManagement } from '@/hooks/useAlbumManagement';
import { useTrackManagement } from '@/hooks/useTrackManagement';
import { useToast } from '@/hooks/use-toast';

const MusicPage = () => {
  const { toast } = useToast();
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('isAdmin') === 'true';
  });
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  useEffect(() => {
    const checkAdminStatus = () => {
      const adminStatus = localStorage.getItem('isAdmin') === 'true';
      const hasToken = !!localStorage.getItem('authToken');
      const isAdminLoggedIn = adminStatus && hasToken;
      
      setIsAdmin(isAdminLoggedIn);
      
      if (isAdminLoggedIn) {
        setShowAdminPanel(true);
      }
    };

    checkAdminStatus();
  }, []);

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

  const handleAdminLogin = async () => {
    try {
      const API_URL = 'https://functions.poehali.dev/52119c2a-82db-4422-894d-e3d5db04d16a';
      
      const response = await fetch(`${API_URL}?path=admin-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: adminPassword })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Неверный пароль');
      }

      const data = await response.json();
      
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('isAdmin', 'true');
      
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
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAdmin');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-vintage-cream via-vintage-brown to-vintage-dark-brown">
      <Header />

      <Shop
        albums={albums}
        tracks={tracks}
        currentTrack={currentTrack ? tracks.findIndex(track => track.id === currentTrack.id) : 0}
        setCurrentTrack={(index: number) => setCurrentTrack(tracks[index])}
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

      {isAdmin && !showAdminPanel && (
        <button
          onClick={() => setShowAdminPanel(true)}
          className="fixed bottom-6 right-6 z-50 bg-vintage-dark-brown hover:bg-vintage-warm text-vintage-cream px-6 py-3 rounded-full shadow-lg transition-all hover:scale-105 flex items-center gap-2"
        >
          <span className="text-lg">⚙️</span>
          <span className="font-medium">Админ панель</span>
        </button>
      )}

      <Footer />

      <SyncIndicator 
        isOnline={isOnline} 
        lastSyncTime={lastSyncTime} 
      />
    </div>
  );
};

export default MusicPage;
