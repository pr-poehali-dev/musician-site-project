import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const ANALYTICS_URL = 'https://functions.poehali.dev/c307ce78-b70c-4224-943f-1036ec49967b';

interface DailyVisit {
  date: string;
  visits: number;
}

interface AnalyticsData {
  summary: { today: number; week: number; month: number; total: number };
  daily: DailyVisit[];
}

const Analytics: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const isAdmin = localStorage.getItem('isAdmin');
    if (!token || isAdmin !== 'true') {
      navigate('/auth');
      return;
    }
    fetch(ANALYTICS_URL)
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [navigate]);

  const maxVisits = data ? Math.max(...data.daily.map(d => d.visits), 1) : 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-vintage-cream via-vintage-brown to-vintage-dark-brown p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="border-vintage-brown text-vintage-brown hover:bg-vintage-brown hover:text-vintage-cream"
          >
            <Icon name="ArrowLeft" size={18} className="mr-2" />
            Назад
          </Button>
          <h1 className="text-3xl font-bold text-vintage-dark-brown flex items-center gap-3">
            <Icon name="BarChart3" size={28} />
            Аналитика посещений
          </h1>
        </div>

        {loading && (
          <div className="text-center text-vintage-brown text-lg py-20">Загружаю данные...</div>
        )}

        {!loading && data && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Сегодня', value: data.summary.today, icon: 'Sun' },
                { label: 'За неделю', value: data.summary.week, icon: 'CalendarDays' },
                { label: 'За месяц', value: data.summary.month, icon: 'Calendar' },
                { label: 'Всего', value: data.summary.total, icon: 'Users' },
              ].map(({ label, value, icon }) => (
                <div key={label} className="bg-vintage-cream/80 rounded-2xl p-6 border border-vintage-warm/30 text-center shadow">
                  <Icon name={icon} size={28} className="mx-auto mb-2 text-vintage-warm" />
                  <div className="text-3xl font-bold text-vintage-dark-brown">{value}</div>
                  <div className="text-sm text-vintage-brown mt-1">{label}</div>
                </div>
              ))}
            </div>

            <div className="bg-vintage-cream/80 rounded-2xl p-6 border border-vintage-warm/30 shadow">
              <h2 className="text-xl font-bold text-vintage-dark-brown mb-6">Посещения за последние 30 дней</h2>
              {data.daily.length === 0 ? (
                <p className="text-vintage-brown text-center py-8">Нет данных за этот период</p>
              ) : (
                <div className="space-y-3">
                  {data.daily.map(({ date, visits }) => (
                    <div key={date} className="flex items-center gap-4">
                      <span className="text-sm text-vintage-brown w-28 shrink-0">
                        {new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                      </span>
                      <div className="flex-1 bg-vintage-brown/20 rounded-full h-6 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-vintage-warm to-vintage-brown rounded-full transition-all"
                          style={{ width: `${(visits / maxVisits) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-vintage-dark-brown w-8 text-right">{visits}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;