import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const { toast } = useToast();

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
              Вход в админ панель
            </CardTitle>
            <CardDescription className="text-vintage-warm/70">
              Введите пароль для доступа к управлению сайтом
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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