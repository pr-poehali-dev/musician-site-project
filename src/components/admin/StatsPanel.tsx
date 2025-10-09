import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Track } from '@/types';
import { getAllStats, getTopTracks, exportStats, resetStats } from '@/utils/trackStats';
import { useToast } from '@/hooks/use-toast';

interface StatsPanelProps {
  tracks: Track[];
}

const StatsPanel: React.FC<StatsPanelProps> = ({ tracks }) => {
  const { toast } = useToast();
  const stats = getAllStats();
  const topTracks = getTopTracks(tracks, 5);

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

  const handleResetStats = () => {
    if (window.confirm('Вы уверены, что хотите сбросить всю статистику? Это действие нельзя отменить.')) {
      resetStats();
      toast({
        title: "🔄 Статистика сброшена",
        description: "Все счетчики обнулены",
      });
      setTimeout(() => window.location.reload(), 1000);
    }
  };

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
              {stats.totalDownloads}
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
              {stats.totalPlays}
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
              {Object.keys(stats.tracks).length}
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
          {topTracks.length > 0 ? (
            <div className="space-y-3">
              {topTracks.map((track, index) => (
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
                      {track.duration}
                    </p>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1 text-vintage-warm">
                      <Icon name="Download" size={14} />
                      <span>{track.downloads || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-vintage-warm">
                      <Icon name="Play" size={14} />
                      <span>{track.plays || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
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
          onClick={handleResetStats}
          variant="outline"
          className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
        >
          <Icon name="RotateCcw" size={16} className="mr-2" />
          Сбросить статистику
        </Button>
      </div>
    </div>
  );
};

export default StatsPanel;
