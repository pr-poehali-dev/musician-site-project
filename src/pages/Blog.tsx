import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/icon';
import Logo from '@/components/Logo';
import { useToast } from '@/hooks/use-toast';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  created_at: string;
  updated_at: string;
}

const Blog = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const isAdmin = user?.username === 'shmelidze';

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://functions.poehali.dev/25aac639-cf81-4eb7-80fc-aa9a157a25e6?path=blog/posts');
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Ошибка загрузки постов:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить посты блога",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('https://functions.poehali.dev/25aac639-cf81-4eb7-80fc-aa9a157a25e6?path=blog/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': user?.id || '',
        },
        body: JSON.stringify({
          title,
          content,
          author: user?.username || 'Дмитрий Шмелидзэ',
        }),
      });

      if (response.ok) {
        toast({
          title: "Успешно",
          description: "Пост создан",
        });
        setTitle('');
        setContent('');
        setIsEditing(false);
        fetchPosts();
      }
    } catch (error) {
      console.error('Ошибка создания поста:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать пост",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePost = async () => {
    if (!editingPost || !title.trim() || !content.trim()) return;

    try {
      const response = await fetch(`https://functions.poehali.dev/25aac639-cf81-4eb7-80fc-aa9a157a25e6?path=blog/posts&id=${editingPost.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': user?.id || '',
        },
        body: JSON.stringify({
          title,
          content,
        }),
      });

      if (response.ok) {
        toast({
          title: "Успешно",
          description: "Пост обновлён",
        });
        setTitle('');
        setContent('');
        setIsEditing(false);
        setEditingPost(null);
        fetchPosts();
      }
    } catch (error) {
      console.error('Ошибка обновления поста:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить пост",
        variant: "destructive",
      });
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Удалить этот пост?')) return;

    try {
      const response = await fetch(`https://functions.poehali.dev/25aac639-cf81-4eb7-80fc-aa9a157a25e6?path=blog/posts&id=${postId}`, {
        method: 'DELETE',
        headers: {
          'X-Auth-Token': user?.id || '',
        },
      });

      if (response.ok) {
        toast({
          title: "Успешно",
          description: "Пост удалён",
        });
        fetchPosts();
      }
    } catch (error) {
      console.error('Ошибка удаления поста:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить пост",
        variant: "destructive",
      });
    }
  };

  const startEdit = (post: BlogPost) => {
    setEditingPost(post);
    setTitle(post.title);
    setContent(post.content);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingPost(null);
    setTitle('');
    setContent('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-vintage-cream via-vintage-brown to-vintage-dark-brown">
      <header className="p-6 border-b border-vintage-brown/20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Logo />
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              className="border-vintage-brown text-vintage-brown hover:bg-vintage-brown hover:text-vintage-cream"
              onClick={() => navigate('/')}
            >
              <Icon name="Home" size={20} className="mr-2" />
              Главная
            </Button>
            {isAdmin && (
              <Button 
                className="bg-vintage-warm hover:bg-vintage-brown text-vintage-cream"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Icon name={isEditing ? "X" : "Plus"} size={20} className="mr-2" />
                {isEditing ? 'Отмена' : 'Новый пост'}
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-vintage-dark-brown mb-4">Блог</h1>
          <p className="text-xl text-vintage-brown">Мысли, истории и вдохновение</p>
        </div>

        {isAdmin && isEditing && (
          <Card className="p-6 mb-8 bg-vintage-cream/90 border-vintage-warm">
            <h2 className="text-2xl font-bold text-vintage-dark-brown mb-4">
              {editingPost ? 'Редактировать пост' : 'Создать новый пост'}
            </h2>
            <div className="space-y-4">
              <Input 
                placeholder="Заголовок поста"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg border-vintage-brown/30"
              />
              <Textarea 
                placeholder="Содержание поста"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                className="border-vintage-brown/30"
              />
              <div className="flex gap-4">
                <Button 
                  className="bg-vintage-warm hover:bg-vintage-brown text-vintage-cream"
                  onClick={editingPost ? handleUpdatePost : handleCreatePost}
                >
                  <Icon name="Save" size={20} className="mr-2" />
                  {editingPost ? 'Сохранить' : 'Опубликовать'}
                </Button>
                {editingPost && (
                  <Button 
                    variant="outline"
                    className="border-vintage-brown text-vintage-brown hover:bg-vintage-brown hover:text-vintage-cream"
                    onClick={cancelEdit}
                  >
                    Отмена
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-vintage-brown text-xl">Загрузка...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="BookOpen" size={64} className="mx-auto mb-4 text-vintage-brown/50" />
            <p className="text-vintage-brown text-xl">Постов пока нет</p>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <Card key={post.id} className="p-8 bg-vintage-cream/90 border-vintage-warm hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-3xl font-bold text-vintage-dark-brown mb-2">{post.title}</h2>
                    <div className="flex items-center gap-4 text-sm text-vintage-brown">
                      <span className="flex items-center gap-1">
                        <Icon name="User" size={16} />
                        {post.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="Calendar" size={16} />
                        {formatDate(post.created_at)}
                      </span>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        variant="outline"
                        className="border-vintage-warm text-vintage-warm hover:bg-vintage-warm hover:text-vintage-cream"
                        onClick={() => startEdit(post)}
                      >
                        <Icon name="Edit" size={16} />
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                        onClick={() => handleDeletePost(post.id)}
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="prose max-w-none text-vintage-brown whitespace-pre-wrap">
                  {post.content}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
