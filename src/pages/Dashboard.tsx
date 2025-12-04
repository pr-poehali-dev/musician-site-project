import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/Logo';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import AlbumForm, { AlbumFormData } from '@/components/AlbumForm';
import AlbumDetail from '@/components/AlbumDetail';

interface Album {
  id: number;
  title: string;
  cover_url?: string;
  price: number;
  created_at: string;
}

interface VisitStats {
  total: number;
  today: number;
  week: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, token, logout, loading } = useAuth();
  const { toast } = useToast();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loadingAlbums, setLoadingAlbums] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [visitStats, setVisitStats] = useState<VisitStats | null>(null);

  const USER_MUSIC_API = 'https://functions.poehali.dev/52119c2a-82db-4422-894d-e3d5db04d16a';
  const TRACK_VISIT_API = 'https://functions.poehali.dev/3d661569-e3dc-4578-8135-90a94a152d74';

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user && token) {
      fetchAlbums();
      fetchVisitStats();
    }
  }, [user, token]);

  const fetchVisitStats = async () => {
    try {
      const response = await fetch(TRACK_VISIT_API);
      if (response.ok) {
        const data = await response.json();
        setVisitStats(data);
      }
    } catch (error) {
      console.error('Error fetching visit stats:', error);
    }
  };

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

  const handleCreateAlbum = async (albumData: AlbumFormData) => {
    try {
      const response = await fetch(`${USER_MUSIC_API}?path=albums`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token!,
        },
        body: JSON.stringify(albumData),
      });

      if (response.ok) {
        toast({
          title: 'Альбом создан!',
          description: 'Ваш альбом успешно добавлен',
        });
        setIsCreateDialogOpen(false);
        fetchAlbums();
      } else {
        const error = await response.json();
        toast({
          title: 'Ошибка',
          description: error.message || 'Не удалось создать альбом',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при создании альбома',
        variant: 'destructive',
      });
    }
  };

  const handleEditAlbum = async (albumData: AlbumFormData) => {
    if (!editingAlbum) return;

    try {
      const response = await fetch(`${USER_MUSIC_API}?path=albums/${editingAlbum.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token!,
        },
        body: JSON.stringify(albumData),
      });

      if (response.ok) {
        toast({
          title: 'Альбом обновлён!',
          description: 'Изменения сохранены',
        });
        setIsEditDialogOpen(false);
        setEditingAlbum(null);
        fetchAlbums();
      } else {
        const error = await response.json();
        toast({
          title: 'Ошибка',
          description: error.message || 'Не удалось обновить альбом',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при обновлении альбома',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAlbum = async (albumId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот альбом?')) return;

    try {
      const response = await fetch(`${USER_MUSIC_API}?path=albums/${albumId}`, {
        method: 'DELETE',
        headers: {
          'X-Auth-Token': token!,
        },
      });

      if (response.ok) {
        toast({
          title: 'Альбом удалён',
          description: 'Альбом успешно удалён',
        });
        fetchAlbums();
      } else {
        toast({
          title: 'Ошибка',
          description: 'Не удалось удалить альбом',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при удалении альбома',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (album: Album) => {
    setEditingAlbum(album);
    setIsEditDialogOpen(true);
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
            <Button
              variant="ghost"
              onClick={() => navigate('/analytics')}
              className="text-vintage-brown hover:text-vintage-dark-brown"
            >
              <Icon name="BarChart3" size={16} className="mr-2" />
              Аналитика
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
        {selectedAlbum ? (
          <AlbumDetail
            album={selectedAlbum}
            token={token!}
            onBack={() => setSelectedAlbum(null)}
          />
        ) : (
        <>
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-vintage-dark-brown mb-2">Личный кабинет</h1>
              <p className="text-vintage-brown">Управляйте своими альбомами и треками</p>
            </div>
            <Button
              onClick={() => navigate('/analytics')}
              className="bg-vintage-brown hover:bg-vintage-dark-brown text-vintage-cream px-6 py-3 text-lg"
              size="lg"
            >
              <Icon name="BarChart3" size={24} className="mr-2" />
              📊 Статистика сайта
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

          <Card 
            className="bg-vintage-cream/80 border-vintage-brown/30 cursor-pointer hover:bg-vintage-cream transition-all"
            onClick={() => navigate('/analytics')}
          >
            <CardHeader>
              <CardTitle className="flex items-center text-vintage-dark-brown">
                <Icon name="BarChart3" size={24} className="mr-2" />
                Аналитика
              </CardTitle>
              <CardDescription className="text-vintage-brown">
                {visitStats ? (
                  <div className="space-y-1 text-sm mt-2">
                    <div className="flex justify-between">
                      <span>Сегодня:</span>
                      <span className="font-semibold">{visitStats.today}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>За неделю:</span>
                      <span className="font-semibold">{visitStats.week}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Всего:</span>
                      <span className="font-semibold">{visitStats.total}</span>
                    </div>
                  </div>
                ) : (
                  'Загрузка...'
                )}
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
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-vintage-warm hover:bg-vintage-brown text-vintage-cream"
            >
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
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-vintage-warm hover:bg-vintage-brown text-vintage-cream"
                >
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
                      <div className="flex flex-col gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => setSelectedAlbum(album)}
                          className="w-full bg-vintage-warm/80 hover:bg-vintage-warm text-vintage-cream"
                        >
                          <Icon name="Music" size={16} className="mr-1" />
                          Управление треками
                        </Button>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => openEditDialog(album)}
                            className="flex-1 border-vintage-brown/30 hover:bg-vintage-brown/10"
                          >
                            <Icon name="Edit" size={16} className="mr-1" />
                            Редактировать
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeleteAlbum(album.id)}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        </>
        )}
      </main>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-vintage-cream border-vintage-brown/30">
          <DialogHeader>
            <DialogTitle className="text-vintage-dark-brown">Создать новый альбом</DialogTitle>
          </DialogHeader>
          <AlbumForm
            onSubmit={handleCreateAlbum}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-vintage-cream border-vintage-brown/30">
          <DialogHeader>
            <DialogTitle className="text-vintage-dark-brown">Редактировать альбом</DialogTitle>
          </DialogHeader>
          {editingAlbum && (
            <AlbumForm
              onSubmit={handleEditAlbum}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingAlbum(null);
              }}
              initialData={{
                title: editingAlbum.title,
                description: '',
                price: editingAlbum.price,
                cover_url: editingAlbum.cover_url || '',
              }}
              isEditing
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;