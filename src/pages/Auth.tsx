import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Logo from '@/components/Logo';
import Icon from '@/components/ui/icon';

const Auth = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { toast } = useToast();
  
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ 
    email: '', 
    password: '', 
    username: '', 
    displayName: '' 
  });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(loginData.email, loginData.password);
      toast({
        title: 'Добро пожаловать!',
        description: 'Вы успешно вошли в систему',
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Ошибка входа',
        description: error instanceof Error ? error.message : 'Проверьте email и пароль',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await register(
        registerData.email, 
        registerData.password, 
        registerData.username, 
        registerData.displayName
      );
      toast({
        title: 'Регистрация успешна!',
        description: 'Добро пожаловать в Shmelidze&Co',
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Ошибка регистрации',
        description: error instanceof Error ? error.message : 'Проверьте введенные данные',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-vintage-cream via-vintage-brown to-vintage-dark-brown flex flex-col">
      <header className="p-6">
        <div className="max-w-6xl mx-auto">
          <Logo />
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-vintage-cream/95 border-vintage-brown/30">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-vintage-dark-brown">Shmelidze&Co</CardTitle>
            <CardDescription className="text-vintage-brown">
              Платформа для музыкантов и меломанов
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-vintage-brown/20">
                <TabsTrigger value="login" className="data-[state=active]:bg-vintage-warm data-[state=active]:text-vintage-cream">
                  Вход
                </TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-vintage-warm data-[state=active]:text-vintage-cream">
                  Регистрация
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email" className="text-vintage-dark-brown">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                      className="border-vintage-brown/30 focus:border-vintage-warm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="login-password" className="text-vintage-dark-brown">Пароль</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                      className="border-vintage-brown/30 focus:border-vintage-warm"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-vintage-warm hover:bg-vintage-brown text-vintage-cream"
                    disabled={loading}
                  >
                    {loading ? 'Вход...' : (
                      <>
                        <Icon name="LogIn" size={20} className="mr-2" />
                        Войти
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Label htmlFor="register-email" className="text-vintage-dark-brown">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="your@email.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                      className="border-vintage-brown/30 focus:border-vintage-warm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="register-username" className="text-vintage-dark-brown">Username (URL профиля)</Label>
                    <Input
                      id="register-username"
                      type="text"
                      placeholder="myusername"
                      value={registerData.username}
                      onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                      required
                      className="border-vintage-brown/30 focus:border-vintage-warm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="register-displayname" className="text-vintage-dark-brown">Отображаемое имя</Label>
                    <Input
                      id="register-displayname"
                      type="text"
                      placeholder="Иван Иванов"
                      value={registerData.displayName}
                      onChange={(e) => setRegisterData({ ...registerData, displayName: e.target.value })}
                      required
                      className="border-vintage-brown/30 focus:border-vintage-warm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="register-password" className="text-vintage-dark-brown">Пароль</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                      className="border-vintage-brown/30 focus:border-vintage-warm"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-vintage-warm hover:bg-vintage-brown text-vintage-cream"
                    disabled={loading}
                  >
                    {loading ? 'Регистрация...' : (
                      <>
                        <Icon name="UserPlus" size={20} className="mr-2" />
                        Зарегистрироваться
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="text-vintage-brown hover:text-vintage-dark-brown"
              >
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                На главную
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
