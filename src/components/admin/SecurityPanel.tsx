import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const SecurityPanel: React.FC = () => {
  const { toast } = useToast();
  const [adminPassword, setAdminPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [isChangingAdmin, setIsChangingAdmin] = useState(false);

  const handleChangeAdminPassword = async () => {
    if (!adminPassword.current || !adminPassword.new || !adminPassword.confirm) {
      toast({
        title: "❌ Ошибка",
        description: "Заполните все поля",
        variant: "destructive",
      });
      return;
    }

    if (adminPassword.new !== adminPassword.confirm) {
      toast({
        title: "❌ Ошибка",
        description: "Новые пароли не совпадают",
        variant: "destructive",
      });
      return;
    }

    if (adminPassword.new.length < 6) {
      toast({
        title: "❌ Ошибка",
        description: "Пароль должен быть минимум 6 символов",
        variant: "destructive",
      });
      return;
    }

    setIsChangingAdmin(true);
    try {
      const API_URL = 'https://functions.poehali.dev/f03a389e-3ffb-4f5a-996b-c993b26230cf';
      
      const response = await fetch(`${API_URL}?action=change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': localStorage.getItem('authToken') || ''
        },
        body: JSON.stringify({
          currentPassword: adminPassword.current,
          newPassword: adminPassword.new
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Не удалось сменить пароль');
      }

      toast({
        title: "✅ Пароль изменен",
        description: "Пароль администратора успешно обновлен",
      });

      setAdminPassword({ current: '', new: '', confirm: '' });
    } catch (error) {
      toast({
        title: "❌ Ошибка",
        description: error instanceof Error ? error.message : "Не удалось сменить пароль",
        variant: "destructive",
      });
    } finally {
      setIsChangingAdmin(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-vintage-cream/95 border-vintage-brown/20">
        <CardHeader>
          <CardTitle className="text-vintage-warm flex items-center gap-2">
            <Icon name="Lock" size={20} />
            Смена пароля администратора
          </CardTitle>
          <CardDescription className="text-vintage-warm/70">
            Измените пароль для входа в админ-панель
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password" className="text-vintage-warm">
              Текущий пароль
            </Label>
            <Input
              id="current-password"
              type="password"
              value={adminPassword.current}
              onChange={(e) => setAdminPassword({ ...adminPassword, current: e.target.value })}
              className="border-vintage-brown/30 focus:border-vintage-dark-brown bg-white"
              placeholder="Введите текущий пароль"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-vintage-warm">
              Новый пароль
            </Label>
            <Input
              id="new-password"
              type="password"
              value={adminPassword.new}
              onChange={(e) => setAdminPassword({ ...adminPassword, new: e.target.value })}
              className="border-vintage-brown/30 focus:border-vintage-dark-brown bg-white"
              placeholder="Минимум 6 символов"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-vintage-warm">
              Подтвердите новый пароль
            </Label>
            <Input
              id="confirm-password"
              type="password"
              value={adminPassword.confirm}
              onChange={(e) => setAdminPassword({ ...adminPassword, confirm: e.target.value })}
              className="border-vintage-brown/30 focus:border-vintage-dark-brown bg-white"
              placeholder="Повторите новый пароль"
            />
          </div>

          <Button
            onClick={handleChangeAdminPassword}
            disabled={isChangingAdmin}
            className="w-full bg-vintage-dark-brown hover:bg-vintage-warm text-vintage-cream"
          >
            {isChangingAdmin ? (
              <>
                <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                Изменение...
              </>
            ) : (
              <>
                <Icon name="Key" size={16} className="mr-2" />
                Изменить пароль администратора
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-vintage-brown/5 border-vintage-brown/10">
        <CardHeader>
          <CardTitle className="text-vintage-warm flex items-center gap-2 text-base">
            <Icon name="Info" size={18} />
            Информация
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-vintage-warm/70">
          <p>• После смены пароля вам потребуется войти заново</p>
          <p>• Используйте надежный пароль (минимум 6 символов)</p>
          <p>• Храните пароль в безопасном месте</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityPanel;
