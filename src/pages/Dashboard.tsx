import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/Logo';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Album {
  id: number;
  title: string;
  cover_url?: string;
  price: number;
  created_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, token, logout, loading } = useAuth();
  const { toast } = useToast();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loadingAlbums, setLoadingAlbums] = useState(true);

  const USER_MUSIC_API = 'https://functions.poehali.dev/user-music';

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user && token) {
      fetchAlbums();
    }
  }, [user, token]);

  const fetchAlbums = async () => {
    try {
      const response = await fetch(`${USER_MUSIC_API}?path=albums`, {
        headers: {
          'X-Auth-Token': token!,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAlbums(data);
      }
    } catch (error) {
      console.error('Error fetching albums:', error);
    } finally {
      setLoadingAlbums(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast({
      title: 'Вы вышли из системы',
      description: 'До встречи!',
    });
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-vintage-cream via-vintage-brown to-vintage-dark-brown flex items-center justify-center">
        <div className="text-vintage-warm text-xl">Загрузка...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-vintage-cream via-vintage-brown to-vintage-dark-brown">
      <header className="p-6 backdrop-blur-sm bg-vintage-cream/80 border-b border-vintage-brown/20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(`/@${user.username}`)}
              className="text-vintage-brown hover:text-vintage-dark-brown"
            >
              <Icon name="ExternalLink" size={16} className="mr-2" />
              Моя страница
            </Button>
            <span className="text-vintage-dark-brown">
              Привет, <strong>{user.display_name}</strong>!
            </span>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-vintage-brown/30 text-vintage-brown hover:bg-vintage-brown hover:text-vintage-cream"
            >
              <Icon name="LogOut" size={16} className="mr-2" />
              Выйти
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-vintage-dark-brown mb-2">Личный кабинет</h1>
          <p className="text-vintage-brown">Управляйте своими альбомами и треками</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-vintage-cream/80 border-vintage-brown/30">
            <CardHeader>
              <CardTitle className="flex items-center text-vintage-dark-brown">
                <Icon name="Disc" size={24} className="mr-2" />
                Альбомы
              </CardTitle>
              <CardDescription className="text-vintage-brown">
                {albums.length} {albums.length === 1 ? 'альбом' : 'альбомов'}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-vintage-cream/80 border-vintage-brown/30">
            <CardHeader>
              <CardTitle className="flex items-center text-vintage-dark-brown">
                <Icon name="Music" size={24} className="mr-2" />
                Треки
              </CardTitle>
              <CardDescription className="text-vintage-brown">
                Скоро доступно
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-vintage-cream/80 border-vintage-brown/30">
            <CardHeader>
              <CardTitle className="flex items-center text-vintage-dark-brown">
                <Icon name="User" size={24} className="mr-2" />
                Профиль
              </CardTitle>
              <CardDescription className="text-vintage-brown">
                @{user.username}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="bg-vintage-cream/80 border-vintage-brown/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-vintage-dark-brown">Мои альбомы</CardTitle>
              <CardDescription className="text-vintage-brown">
                Создавайте и управляйте своими альбомами
              </CardDescription>
            </div>
            <Button className="bg-vintage-warm hover:bg-vintage-brown text-vintage-cream">
              <Icon name="Plus" size={20} className="mr-2" />
              Создать альбом
            </Button>
          </CardHeader>
          <CardContent>
            {loadingAlbums ? (
              <p className="text-vintage-brown text-center py-8">Загрузка альбомов...</p>
            ) : albums.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="Disc" size={48} className="mx-auto mb-4 text-vintage-brown/40" />
                <p className="text-vintage-brown mb-4">У вас пока нет альбомов</p>
                <Button className="bg-vintage-warm hover:bg-vintage-brown text-vintage-cream">
                  <Icon name="Plus" size={20} className="mr-2" />
                  Создать первый альбом
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {albums.map((album) => (
                  <Card key={album.id} className="border-vintage-brown/20">
                    <CardContent className="p-4">
                      {album.cover_url && (
                        <img 
                          src={album.cover_url} 
                          alt={album.title}
                          className="w-full h-48 object-cover rounded-lg mb-3"
                        />
                      )}
                      <h3 className="font-bold text-vintage-dark-brown mb-1">{album.title}</h3>
                      <p className="text-sm text-vintage-brown mb-3">{album.price} ₽</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 border-vintage-brown/30">
                          <Icon name="Edit" size={16} className="mr-1" />
                          Редактировать
                        </Button>
                        <Button size="sm" variant="outline" className="border-vintage-brown/30">
                          <Icon name="ExternalLink" size={16} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;