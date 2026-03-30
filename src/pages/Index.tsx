import { useEffect } from 'react';
import HomePage from '@/components/HomePage';
import SEO from '@/components/SEO';
import StructuredData from '@/components/StructuredData';

const TRACK_VISIT_URL = 'https://functions.poehali.dev/3d661569-e3dc-4578-8135-90a94a152d74';

const Index = () => {
  useEffect(() => {
    fetch(TRACK_VISIT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page_url: window.location.pathname,
      }),
    }).catch(() => {
      // Тихо игнорируем ошибки отслеживания
    });
  }, []);

  return (
    <>
      <SEO 
        title="Дмитрий Шмелидзэ — Официальный сайт. Авторские песни и современная музыка"
        description="Официальный сайт Дмитрия Шмелидзэ — автора-исполнителя из России. Авторские песни, студийные записи, альбомы и новые треки 2026."
        keywords="Дмитрий Шмелидзэ, авторские песни, музыка, российский музыкант, песни под гитару, студийная запись, слушать онлайн, ХИТы 2026"
      />
      <StructuredData type="person" />
      <StructuredData type="musicGroup" />
      <HomePage />
    </>
  );
};

export default Index;