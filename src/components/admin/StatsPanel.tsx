import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Icon from '@/components/ui/icon';
import { Track } from '@/types';
import { exportStats, resetStats } from '@/utils/trackStats';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/utils/apiClient';

interface StatsPanelProps {
  tracks: Track[];
}

interface StatsData {
  totals: {
    total_plays: number;
    total_downloads: number;
    tracked_tracks: number;
  };
  top_tracks: Array<{
    id: string;
    title: string;
    plays_count: number;
    downloads_count: number;
  }>;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ tracks }) => {
  const { toast } = useToast();
  const [stats, setStats] = useState<StatsData>({
    totals: {
      total_plays: 0,
      total_downloads: 0,
      tracked_tracks: 0
    },
    top_tracks: []
  });
  const [loading, setLoading] = useState(true);
  const [showResetDialog, setShowResetDialog] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await apiClient.getStats();
      setStats(data);
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
      toast({
        title: "❌ Ошибка загрузки статистики",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportStats = () => {
    try {
      exportStats();
      toast({
        title: "✅ Статистика экспортирована",
        description: "Файл успешно сохранен",
      });
    } catch (error) {
      toast({
        title: "❌ Ошибка экспорта",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleResetStats = async () => {
    try {
      resetStats();
      await apiClient.resetStats();
      await loadStats();
      toast({
        title: "🔄 Статистика сброшена",
        description: "Все счетчики обнулены",
      });
      setShowResetDialog(false);
    } catch (error) {
      const errorMessage = (error as Error).message;
      const isAuthError = errorMessage.includes('Сессия истекла') || errorMessage.includes('авторизация');
      
      toast({
        title: "❌ Ошибка сброса статистики",
        description: errorMessage,
        variant: "destructive",
        action: isAuthError ? (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = '/music'}
            className="bg-white"
          >
            Войти
          </Button>
        ) : undefined,
      });
      setShowResetDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-vintage-warm">Загрузка статистики...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-vintage-cream/50 border-vintage-brown/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-vintage-warm/70 flex items-center gap-2">
              <Icon name="Download" size={16} />
              Всего скачиваний
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-vintage-dark-brown">
              {stats.totals.total_downloads}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-vintage-cream/50 border-vintage-brown/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-vintage-warm/70 flex items-center gap-2">
              <Icon name="Play" size={16} />
              Всего воспроизведений
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-vintage-dark-brown">
              {stats.totals.total_plays}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-vintage-cream/50 border-vintage-brown/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-vintage-warm/70 flex items-center gap-2">
              <Icon name="Music" size={16} />
              Треков отслеживается
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-vintage-dark-brown">
              {stats.totals.tracked_tracks}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-vintage-cream/50 border-vintage-brown/20">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-vintage-dark-brown flex items-center gap-2">
            <Icon name="TrendingUp" size={20} />
            Топ 5 треков
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.top_tracks.length > 0 ? (
            <div className="space-y-3">
              {stats.top_tracks.map((track, index) => {
                const fullTrack = tracks.find(t => t.id === track.id);
                return (
                  <div 
                    key={track.id}
                    className="flex items-center gap-3 p-3 bg-vintage-brown/5 rounded-lg"
                  >
                    <div className="flex items-center justify-center w-8 h-8 bg-vintage-dark-brown text-vintage-cream rounded-full font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-vintage-dark-brown truncate">
                        {track.title}
                      </p>
                      <p className="text-xs text-vintage-warm/60">
                        {fullTrack?.duration || '—'}
                      </p>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-1 text-vintage-warm">
                        <Icon name="Download" size={14} />
                        <span>{track.downloads_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 text-vintage-warm">
                        <Icon name="Play" size={14} />
                        <span>{track.plays_count || 0}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-vintage-warm/60 py-6">
              Пока нет данных о воспроизведении треков
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button
          onClick={handleExportStats}
          variant="outline"
          className="border-vintage-dark-brown text-vintage-dark-brown hover:bg-vintage-dark-brown hover:text-vintage-cream"
        >
          <Icon name="Download" size={16} className="mr-2" />
          Экспортировать статистику
        </Button>
        
        <Button
          onClick={() => setShowResetDialog(true)}
          variant="outline"
          className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
        >
          <Icon name="RotateCcw" size={16} className="mr-2" />
          Сбросить статистику
        </Button>
      </div>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent className="bg-vintage-cream border-vintage-warm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-vintage-dark-brown flex items-center gap-2">
              <Icon name="AlertTriangle" size={24} className="text-red-600" />
              Подтверждение сброса статистики
            </AlertDialogTitle>
            <AlertDialogDescription className="text-vintage-warm/80">
              Вы уверены, что хотите сбросить всю статистику? Это действие удалит:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Все счётчики прослушиваний</li>
                <li>Все счётчики скачиваний</li>
                <li>Историю воспроизведений</li>
              </ul>
              <p className="mt-3 font-semibold text-red-600">
                Это действие нельзя отменить!
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-vintage-cream border-vintage-brown text-vintage-dark-brown hover:bg-vintage-brown/10">
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetStats}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Да, сбросить статистику
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StatsPanel;