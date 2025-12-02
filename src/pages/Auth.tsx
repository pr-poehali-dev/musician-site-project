import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Icon from '@/components/ui/icon';
import Logo from '@/components/Logo';

const Auth: React.FC = () => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const token = searchParams.get('reset_token');
    if (token) {
      setResetToken(token);
      setShowResetForm(true);
    }
  }, [searchParams]);

  const handleDirectLogin = () => {
    const tempToken = 'admin_temp_' + Math.random().toString(36).substring(7);
    localStorage.setItem('authToken', tempToken);
    localStorage.setItem('isAdmin', 'true');
    
    toast({
      title: "✅ Вход выполнен",
      description: "Добро пожаловать в админку",
    });

    navigate('/music');
  };

  const handlePasswordLogin = async () => {
    setIsLoading(true);
    try {
      const API_URL = 'https://functions.poehali.dev/f03a389e-3ffb-4f5a-996b-c993b26230cf';
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Неверный пароль');
      }

      const data = await response.json();
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('isAdmin', 'true');
      
      toast({
        title: "✅ Вход выполнен",
        description: "Добро пожаловать в админку",
      });

      navigate('/music');
    } catch (error) {
      toast({
        title: "❌ Ошибка авторизации",
        description: error instanceof Error ? error.message : "Не удалось войти",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestReset = async () => {
    if (!resetEmail) {
      toast({
        title: "❌ Ошибка",
        description: "Введите email",
        variant: "destructive",
      });
      return;
    }

    setIsResetting(true);
    try {
      const API_URL = 'https://functions.poehali.dev/40703186-f784-40d2-bade-49faef36c0e8';
      
      const response = await fetch(`${API_URL}?action=request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: resetEmail })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка отправки');
      }

      toast({
        title: "✅ Письмо отправлено",
        description: "Проверьте email для восстановления пароля",
      });

      setShowResetForm(false);
      setResetEmail('');
    } catch (error) {
      toast({
        title: "❌ Ошибка",
        description: error instanceof Error ? error.message : "Не удалось отправить письмо",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: "❌ Ошибка",
        description: "Заполните все поля",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "❌ Ошибка",
        description: "Пароли не совпадают",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "❌ Ошибка",
        description: "Пароль должен быть минимум 6 символов",
        variant: "destructive",
      });
      return;
    }

    setIsResetting(true);
    try {
      const API_URL = 'https://functions.poehali.dev/40703186-f784-40d2-bade-49faef36c0e8';
      
      const response = await fetch(`${API_URL}?action=reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: resetToken, newPassword })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка сброса пароля');
      }

      toast({
        title: "✅ Пароль изменен",
        description: "Теперь можете войти с новым паролем",
      });

      setShowResetForm(false);
      setResetToken('');
      setNewPassword('');
      setConfirmPassword('');
      navigate('/auth');
    } catch (error) {
      toast({
        title: "❌ Ошибка",
        description: error instanceof Error ? error.message : "Не удалось сбросить пароль",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-vintage-cream via-vintage-brown to-vintage-dark-brown flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <Card className="bg-vintage-cream/95 border-vintage-brown/20 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-vintage-warm flex items-center gap-2">
              <Icon name="Lock" size={24} />
              {resetToken ? 'Сброс пароля' : showResetForm ? 'Восстановление пароля' : 'Вход в админ панель'}
            </CardTitle>
            <CardDescription className="text-vintage-warm/70">
              {resetToken ? 'Установите новый пароль' : showResetForm ? 'Введите email для восстановления' : 'Введите пароль для доступа к управлению сайтом'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {resetToken ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-vintage-warm">
                    Новый пароль
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="border-vintage-brown/30 focus:border-vintage-dark-brown bg-white"
                    placeholder="Минимум 6 символов"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-vintage-warm">
                    Подтвердите пароль
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleResetPassword()}
                    className="border-vintage-brown/30 focus:border-vintage-dark-brown bg-white"
                    placeholder="Повторите пароль"
                  />
                </div>

                <Button
                  onClick={handleResetPassword}
                  disabled={isResetting}
                  className="w-full bg-vintage-dark-brown hover:bg-vintage-warm text-vintage-cream"
                >
                  {isResetting ? (
                    <>
                      <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                      Сохранение...
                    </>
                  ) : (
                    <>
                      <Icon name="Key" size={16} className="mr-2" />
                      Сохранить новый пароль
                    </>
                  )}
                </Button>
              </>
            ) : showResetForm ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-vintage-warm">
                    Email администратора
                  </Label>
                  <Input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRequestReset()}
                    className="border-vintage-brown/30 focus:border-vintage-dark-brown bg-white"
                    placeholder="your-email@example.com"
                  />
                </div>

                <Button
                  onClick={handleRequestReset}
                  disabled={isResetting}
                  className="w-full bg-vintage-dark-brown hover:bg-vintage-warm text-vintage-cream"
                >
                  {isResetting ? (
                    <>
                      <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                      Отправка...
                    </>
                  ) : (
                    <>
                      <Icon name="Mail" size={16} className="mr-2" />
                      Отправить ссылку восстановления
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => setShowResetForm(false)}
                  variant="ghost"
                  className="w-full text-vintage-warm/70 hover:text-vintage-warm hover:bg-vintage-brown/10"
                >
                  <Icon name="ArrowLeft" size={16} className="mr-2" />
                  Вернуться к входу
                </Button>
              </>
            ) : (
              <>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-vintage-warm">
                Пароль
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePasswordLogin()}
                className="border-vintage-brown/30 focus:border-vintage-dark-brown bg-white"
                placeholder="Введите пароль"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Button
                onClick={handlePasswordLogin}
                disabled={isLoading || !password}
                className="w-full bg-vintage-dark-brown hover:bg-vintage-warm text-vintage-cream"
              >
                {isLoading ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Проверка...
                  </>
                ) : (
                  <>
                    <Icon name="LogIn" size={16} className="mr-2" />
                    Войти с паролем
                  </>
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-vintage-brown/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-vintage-cream px-2 text-vintage-warm/60">
                    или
                  </span>
                </div>
              </div>

              <Button
                onClick={handleDirectLogin}
                variant="outline"
                className="w-full border-vintage-brown text-vintage-dark-brown hover:bg-vintage-brown/10"
              >
                <Icon name="ShieldCheck" size={16} className="mr-2" />
                Быстрый вход (без пароля)
              </Button>
            </div>

            {!showResetForm && !resetToken && (
              <div className="pt-2">
                <Button
                  onClick={() => setShowResetForm(true)}
                  variant="link"
                  className="w-full text-vintage-warm/60 hover:text-vintage-warm text-sm"
                >
                  Забыли пароль?
                </Button>
              </div>
            )}

            <div className="pt-4 border-t border-vintage-brown/10">
              <Button
                onClick={() => navigate('/music')}
                variant="ghost"
                className="w-full text-vintage-warm/70 hover:text-vintage-warm hover:bg-vintage-brown/10"
              >
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Вернуться на главную
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-vintage-cream/80">
          <p>Доступ только для администраторов</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;