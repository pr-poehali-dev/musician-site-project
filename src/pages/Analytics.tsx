import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AnalyticsData {
  summary: {
    today: number;
    week: number;
    month: number;
    total: number;
  };
  daily: Array<{
    date: string;
    visits: number;
  }>;
}

const Analytics = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/c307ce78-b70c-4224-943f-1036ec49967b');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-vintage-light flex items-center justify-center">
        <div className="text-vintage-brown text-xl">Загрузка статистики...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-vintage-light flex items-center justify-center">
        <div className="text-vintage-brown text-xl">Ошибка загрузки данных</div>
      </div>
    );
  }

  const chartData = [...data.daily].reverse();

  return (
    <div className="min-h-screen bg-vintage-light py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="mb-4 text-vintage-brown hover:text-vintage-dark-brown"
          >
            <Icon name="ArrowLeft" size={20} className="mr-2" />
            Назад
          </Button>
          <h1 className="text-4xl font-bold text-vintage-dark-brown mb-2">Аналитика посещений</h1>
          <p className="text-vintage-brown">Подробная статистика посещений вашего сайта</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-vintage-cream/80 border-vintage-brown/30">
            <CardHeader>
              <CardTitle className="flex items-center text-vintage-dark-brown">
                <Icon name="Calendar" size={24} className="mr-2" />
                Сегодня
              </CardTitle>
              <CardDescription className="text-3xl font-bold text-vintage-brown mt-2">
                {data.summary.today}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-vintage-cream/80 border-vintage-brown/30">
            <CardHeader>
              <CardTitle className="flex items-center text-vintage-dark-brown">
                <Icon name="CalendarDays" size={24} className="mr-2" />
                За неделю
              </CardTitle>
              <CardDescription className="text-3xl font-bold text-vintage-brown mt-2">
                {data.summary.week}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-vintage-cream/80 border-vintage-brown/30">
            <CardHeader>
              <CardTitle className="flex items-center text-vintage-dark-brown">
                <Icon name="CalendarRange" size={24} className="mr-2" />
                За месяц
              </CardTitle>
              <CardDescription className="text-3xl font-bold text-vintage-brown mt-2">
                {data.summary.month}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-vintage-cream/80 border-vintage-brown/30">
            <CardHeader>
              <CardTitle className="flex items-center text-vintage-dark-brown">
                <Icon name="TrendingUp" size={24} className="mr-2" />
                Всего
              </CardTitle>
              <CardDescription className="text-3xl font-bold text-vintage-brown mt-2">
                {data.summary.total}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="bg-vintage-cream/80 border-vintage-brown/30">
          <CardHeader>
            <CardTitle className="text-vintage-dark-brown">График посещений за последние 30 дней</CardTitle>
            <CardDescription className="text-vintage-brown">
              Ежедневная статистика визитов на сайт
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#8B7355" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  stroke="#8B7355"
                  tick={{ fill: '#8B7355' }}
                />
                <YAxis 
                  stroke="#8B7355"
                  tick={{ fill: '#8B7355' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFF8DC', 
                    border: '1px solid #8B7355',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#654321' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="visits" 
                  stroke="#654321" 
                  strokeWidth={3}
                  dot={{ fill: '#654321', r: 5 }}
                  activeDot={{ r: 8 }}
                  name="Посещений"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;