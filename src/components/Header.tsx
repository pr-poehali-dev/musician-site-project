import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import Logo from '@/components/Logo';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-sm bg-vintage-cream/80 border-b border-vintage-brown/20">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Logo />
          <div className="hidden md:flex space-x-8">
            <button 
              onClick={() => navigate('/')} 
              className={`text-vintage-warm hover:text-vintage-dark-brown transition-colors ${location.pathname === '/' ? 'font-semibold' : ''}`}
            >
              Главная
            </button>
            {location.pathname === '/music' ? (
              <>
                <a href="#music" className="text-vintage-warm hover:text-vintage-dark-brown transition-colors">Песни и альбомы</a>
                <a href="#shop" className="text-vintage-warm hover:text-vintage-dark-brown transition-colors">Альбомы</a>
                <a href="#contact" className="text-vintage-warm hover:text-vintage-dark-brown transition-colors">Контакты</a>
              </>
            ) : (
              <button 
                onClick={() => navigate('/music')} 
                className="text-vintage-warm hover:text-vintage-dark-brown transition-colors"
              >
                Музыка
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/auth')}
            >
              <Icon name="Settings" size={20} />
            </Button>
            <Button variant="ghost" className="md:hidden">
              <Icon name="Menu" size={24} />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
