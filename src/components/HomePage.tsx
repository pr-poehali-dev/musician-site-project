import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-green-900 to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Текстовая часть */}
            <div className="text-center md:text-left">
              <Badge className="mb-6 px-4 py-2 bg-green-600 text-white hover:bg-green-700">🎵 Авторские песни</Badge>
              
              <h1 className="text-4xl md:text-6xl text-white bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent font-extrabold mb-6">
                Музыка слов от сердца к клавишам
              </h1>
              
              <p className="text-xl text-gray-300 mb-8">Официальный сайт Дмитрия Шмелидзэ</p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button 
                  size="lg" 
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg"
                  onClick={() => navigate('/music')}
                >
                  <Icon name="Music" size={20} className="mr-2" />
                  Слушать музыку
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-green-400 text-green-400 hover:bg-green-400 hover:text-white px-8 py-4 text-lg"
                  onClick={() => navigate('/music')}
                >
                  <Icon name="Music2" size={20} className="mr-2" />
                  Авторские песни
                </Button>
              </div>
            </div>
            
            {/* Фото музыканта */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 rounded-full overflow-hidden shadow-2xl border-4 border-green-400/30 bg-gray-800/50 backdrop-blur-sm">
                  <img 
                    src="/img/7fa09eda-4272-4772-b123-f46dd3566acd.jpg" 
                    alt="Дмитрий Шмелидзэ - музыкант"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Декоративные элементы */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-green-500 rounded-full opacity-60"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-emerald-400 rounded-full opacity-80"></div>
                <div className="absolute top-8 -left-8 w-4 h-4 bg-green-300 rounded-full opacity-40"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-white mb-16">Почему выбирают мои песни</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-gray-800/50 rounded-2xl backdrop-blur-sm border border-green-500/20">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="Headphones" size={32} className="text-white" />
              </div>
              <h4 className="text-xl font-bold text-white mb-4">Эксклюзивные треки</h4>
              <p className="text-gray-300">
                Все треки записаны и обработаны в студийном качестве для максимального погружения
              </p>
            </div>
            
            <div className="text-center p-8 bg-gray-800/50 rounded-2xl backdrop-blur-sm border border-green-500/20">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="Heart" size={32} className="text-white" />
              </div>
              <h4 className="text-xl font-bold text-white mb-4">С душой</h4>
              <p className="text-gray-300">Каждая песня не просто набор звуков, а откровенный разговор с вами о том, что действительно важно.</p>
            </div>
            
            <div className="text-center p-8 bg-gray-800/50 rounded-2xl backdrop-blur-sm border border-green-500/20">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="Clock" size={32} className="text-white" />
              </div>
              <h4 className="text-xl font-bold text-white mb-4">Глубокий смысл</h4>
              <p className="text-gray-300">В моих текстах нет пустых слов. Каждая строчка наполнена смыслом и отражает реальные жизненные истории.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 bg-gradient-to-r from-green-800/30 to-emerald-800/30">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl font-bold text-white mb-6">
            Готовы окунуться в мир музыки?
          </h3>
          <p className="text-xl text-gray-300 mb-8">
            Откройте для себя коллекцию уникальных треков уже сейчас
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-12 py-4 text-lg"
            onClick={() => navigate('/music')}
          >
            <Icon name="Play" size={20} className="mr-2" />
            Начать прослушивание
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;