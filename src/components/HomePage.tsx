import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import Logo from '@/components/Logo';
import TopTracks from '@/components/TopTracks';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-vintage-cream via-vintage-brown to-vintage-dark-brown">
      {/* Header with Logo */}
      <header className="p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo />
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Текстовая часть */}
            <div className="text-center md:text-left">
              <Badge className="mb-6 px-4 py-2 bg-vintage-warm text-vintage-cream hover:bg-vintage-brown">🎵Официальный сайт Дмитрия Шмелидзэ</Badge>
              
              <h1 className="md:text-3xl text-vintage-dark-brown text-center my-[9px] px-7 text-2xl font-medium">Иногда мне кажется, что песня — это способ разговаривать, когда обычных слов не хватает. Музыка знает короткие дороги к тем местам внутри нас, куда логика не дотягивается.</h1>
              
              <p className="text-xl mb-8 text-[#72430d]"></p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button 
                  size="lg" 
                  className="bg-vintage-warm hover:bg-vintage-brown text-vintage-cream px-8 py-4 text-lg"
                  onClick={() => navigate('/music')}
                >
                  <Icon name="Music" size={20} className="mr-2" />
                  Слушать музыку
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-vintage-brown text-vintage-brown hover:bg-vintage-brown hover:text-vintage-cream px-8 py-4 text-lg"
                  onClick={() => navigate('/music')}
                >
                  <Icon name="Music2" size={20} className="mr-2" />
                  Авторские песни
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-vintage-dark-brown text-vintage-dark-brown hover:bg-vintage-dark-brown hover:text-vintage-cream px-8 py-4 text-lg"
                  onClick={() => navigate('/contact')}
                >
                  <Icon name="MessageCircle" size={20} className="mr-2" />
                  Контакты
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-vintage-warm text-vintage-warm hover:bg-vintage-warm hover:text-vintage-cream px-8 py-4 text-lg"
                  onClick={() => navigate('/blog')}
                >
                  <Icon name="BookOpen" size={20} className="mr-2" />
                  Блог
                </Button>
              </div>
            </div>
            
            {/* Фото музыканта */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 rounded-full overflow-hidden shadow-2xl border-4 border-vintage-warm/40 bg-gradient-to-br from-vintage-brown/30 to-vintage-dark-brown/30 backdrop-blur-sm">
                  <img 
                    src="https://cdn.poehali.dev/projects/43e5d54d-0b57-4be1-b3b3-e23b086ac4cc/bucket/6ce354ae-cf28-416e-95b7-0d84737302a4.jpg" 
                    alt="Дмитрий Шмелидзэ - музыкант"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Декоративные элементы */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-vintage-warm rounded-full opacity-70"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-vintage-brown rounded-full opacity-80"></div>
                <div className="absolute top-8 -left-8 w-4 h-4 bg-vintage-cream rounded-full opacity-60"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Tracks Section */}
      <div className="py-20 px-4 bg-vintage-cream/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 px-4 py-2 bg-vintage-warm text-vintage-cream hover:bg-vintage-brown">
              <Icon name="TrendingUp" size={16} className="mr-2" />
              Обновляется автоматически
            </Badge>
            <h2 className="text-4xl font-bold text-vintage-dark-brown mb-4">
              Самые популярные треки
            </h2>
            <p className="text-lg text-vintage-brown">
              Композиции, которые слушают чаще всего
            </p>
          </div>
          <TopTracks limit={5} onTrackClick={() => navigate('/music')} />
          <div className="text-center mt-8">
            <Button 
              size="lg" 
              className="bg-vintage-warm hover:bg-vintage-brown text-vintage-cream px-8 py-4 text-lg"
              onClick={() => navigate('/music')}
            >
              <Icon name="Music" size={20} className="mr-2" />
              Посмотреть все треки
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-vintage-dark-brown mb-16">Почему выбирают мои песни</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-vintage-cream/50 rounded-2xl backdrop-blur-sm border border-vintage-warm/30">
              <div className="w-16 h-16 bg-gradient-to-br from-vintage-warm to-vintage-brown rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="Headphones" size={32} className="text-vintage-cream" />
              </div>
              <h4 className="text-xl font-bold text-vintage-dark-brown mb-4">Эксклюзивные треки</h4>
              <p className="text-vintage-brown">Это музыкальные произведения, которые выделяются своей уникальностью и недоступностью для широкой аудитории</p>
            </div>
            
            <div className="text-center p-8 bg-vintage-cream/50 rounded-2xl backdrop-blur-sm border border-vintage-warm/30">
              <div className="w-16 h-16 bg-gradient-to-br from-vintage-warm to-vintage-brown rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="Heart" size={32} className="text-vintage-cream" />
              </div>
              <h4 className="text-xl font-bold text-vintage-dark-brown mb-4">С душой</h4>
              <p className="text-vintage-brown">Каждая песня не просто набор звуков, а откровенный разговор с вами о том, что действительно важно.</p>
            </div>
            
            <div className="text-center p-8 bg-vintage-cream/50 rounded-2xl backdrop-blur-sm border border-vintage-warm/30">
              <div className="w-16 h-16 bg-gradient-to-br from-vintage-warm to-vintage-brown rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="Clock" size={32} className="text-vintage-cream" />
              </div>
              <h4 className="text-xl font-bold text-vintage-dark-brown mb-4">Глубокий смысл</h4>
              <p className="text-vintage-brown">В моих текстах нет пустых слов. Каждая строчка наполнена смыслом и отражает реальные жизненные истории.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 bg-vintage-dark-brown/40">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl font-bold text-vintage-cream mb-6">
            Готовы окунуться в мир музыки?
          </h3>
          <p className="text-xl text-vintage-cream/80 mb-8">
            Откройте для себя коллекцию уникальных треков уже сейчас
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-vintage-warm hover:bg-vintage-brown text-vintage-cream px-12 py-4 text-lg shadow-xl"
              onClick={() => navigate('/music')}
            >
              <Icon name="Play" size={20} className="mr-2" />
              Начать прослушивание
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="border-vintage-cream text-vintage-cream hover:bg-vintage-cream hover:text-vintage-dark-brown px-12 py-4 text-lg"
              onClick={() => navigate('/contact')}
            >
              <Icon name="MessageCircle" size={20} className="mr-2" />
              Связаться
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;