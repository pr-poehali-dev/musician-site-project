import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-20 text-center">
          <Badge className="mb-6 px-4 py-2 bg-purple-600 text-white hover:bg-purple-700">
            🎵 Винтажная музыка
          </Badge>
          
          <h1 className="md:text-8xl text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-extrabold text-4xl my-1.5 py-[29px] px-0 mx-0 text-center">Музыка слов 
 от сердца к клавишам</h1>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            Дмитрия Шмелидзэ
          </h2>
          
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Исследуйте мир винтажной музыки. Коллекция уникальных треков с душой прошлых эпох,
            которые перенесут вас в атмосферу ностальгии и романтики.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg"
              onClick={() => navigate('/music')}
            >
              <Icon name="Music" size={20} className="mr-2" />
              Слушать музыку
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white px-8 py-4 text-lg"
              onClick={() => navigate('/about')}
            >
              <Icon name="User" size={20} className="mr-2" />
              Об исполнителе
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-white mb-16">
            Почему выбирают нашу музыку
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-gray-800/50 rounded-2xl backdrop-blur-sm border border-purple-500/20">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="Headphones" size={32} className="text-white" />
              </div>
              <h4 className="text-xl font-bold text-white mb-4">Высокое качество</h4>
              <p className="text-gray-300">
                Все треки записаны и обработаны в студийном качестве для максимального погружения
              </p>
            </div>
            
            <div className="text-center p-8 bg-gray-800/50 rounded-2xl backdrop-blur-sm border border-purple-500/20">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="Heart" size={32} className="text-white" />
              </div>
              <h4 className="text-xl font-bold text-white mb-4">С душой</h4>
              <p className="text-gray-300">
                Каждая композиция создана с любовью и передает глубокие эмоции автора
              </p>
            </div>
            
            <div className="text-center p-8 bg-gray-800/50 rounded-2xl backdrop-blur-sm border border-purple-500/20">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="Clock" size={32} className="text-white" />
              </div>
              <h4 className="text-xl font-bold text-white mb-4">Винтажный стиль</h4>
              <p className="text-gray-300">
                Уникальное звучание, вдохновленное лучшими традициями прошлых десятилетий
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 bg-gradient-to-r from-purple-800/30 to-pink-800/30">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl font-bold text-white mb-6">
            Готовы окунуться в мир музыки?
          </h3>
          <p className="text-xl text-gray-300 mb-8">
            Откройте для себя коллекцию уникальных треков уже сейчас
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-4 text-lg"
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