import { useState, useEffect } from 'react';
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
  
  // Капча
  const [captchaQuestion, setCaptchaQuestion] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState(0);
  const [userCaptchaAnswer, setUserCaptchaAnswer] = useState('');
  
  // Генерация новой капчи
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let answer = 0;
    let question = '';
    
    switch(operation) {
      case '+':
        answer = num1 + num2;
        question = `${num1} + ${num2}`;
        break;
      case '-':
        // Делаем так, чтобы результат был положительным
        const larger = Math.max(num1, num2);
        const smaller = Math.min(num1, num2);
        answer = larger - smaller;
        question = `${larger} - ${smaller}`;
        break;
      case '*':
        // Уменьшаем числа для умножения
        const smallNum1 = Math.floor(Math.random() * 5) + 1;
        const smallNum2 = Math.floor(Math.random() * 5) + 1;
        answer = smallNum1 * smallNum2;
        question = `${smallNum1} × ${smallNum2}`;
        break;
    }
    
    setCaptchaQuestion(question);
    setCaptchaAnswer(answer);
  };
  
  // Генерируем капчу при загрузке компонента
  useEffect(() => {
    generateCaptcha();
  }, []);

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
    
    // Проверка капчи
    if (parseInt(userCaptchaAnswer) !== captchaAnswer) {
      toast({
        title: 'Неверный ответ',
        description: 'Решите математический пример правильно',
        variant: 'destructive',
      });
      generateCaptcha(); // Генерируем новую капчу
      setUserCaptchaAnswer('');
      return;
    }
    
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
      generateCaptcha(); // Генерируем новую капчу при ошибке
      setUserCaptchaAnswer('');
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
                  
                  {/* Капча */}
                  <div className="p-4 bg-vintage-brown/10 rounded-lg border border-vintage-brown/30">
                    <Label htmlFor="captcha" className="text-vintage-dark-brown flex items-center gap-2 mb-2">
                      <Icon name="ShieldCheck" size={16} className="text-vintage-warm" />
                      Подтвердите, что вы человек
                    </Label>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-vintage-cream p-3 rounded border border-vintage-brown/20 text-center">
                        <span className="text-2xl font-bold text-vintage-dark-brown font-mono">
                          {captchaQuestion} = ?
                        </span>
                      </div>
                      <Input
                        id="captcha"
                        type="number"
                        placeholder="Ответ"
                        value={userCaptchaAnswer}
                        onChange={(e) => setUserCaptchaAnswer(e.target.value)}
                        required
                        className="w-24 border-vintage-brown/30 focus:border-vintage-warm text-center text-lg font-semibold"
                      />
                    </div>
                    <p className="text-xs text-vintage-brown/70 mt-2">
                      Решите простой математический пример
                    </p>
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