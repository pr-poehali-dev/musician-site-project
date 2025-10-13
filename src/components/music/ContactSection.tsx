import React from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const ContactSection: React.FC = () => {
  const handleCopyrightInquiry = () => {
    const message = 'Здравствуйте! Интересует покупка авторских прав на песни.';
    const telegramUrl = `https://t.me/dshmelidze?text=${encodeURIComponent(message)}`;
    window.open(telegramUrl, '_blank');
  };

  return (
    <section id="contact" className="py-16 px-6 bg-vintage-dark-brown">
      <div className="max-w-4xl mx-auto text-center">
        <h3 className="text-4xl font-bold text-vintage-cream mb-8">Контакты</h3>
        
        <div className="mb-12">
          <div className="bg-vintage-brown/30 rounded-xl p-8 border-2 border-vintage-warm/20">
            <h4 className="text-2xl font-bold text-vintage-warm mb-3">Покупка авторских прав</h4>
            <p className="text-vintage-cream/80 mb-6 max-w-2xl mx-auto">
              Заинтересованы в покупке полных авторских прав на песни для коммерческого использования? Свяжитесь со мной напрямую.
            </p>
            <Button 
              onClick={handleCopyrightInquiry}
              className="bg-vintage-warm hover:bg-vintage-brown text-vintage-cream font-semibold px-8 py-6 text-lg transition-all duration-300 hover:scale-105"
            >
              <Icon name="MessageCircle" size={24} className="mr-2" />
              Связаться по поводу авторских прав
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 text-vintage-cream/80">
          <div>
            <h4 className="text-xl font-semibold mb-2 text-vintage-warm">Email</h4>
            <p>vintage.soul@music.com</p>
          </div>
          <div>
            <h4 className="text-xl font-semibold mb-2 text-vintage-warm">Телефон</h4>
            <p>+7 (999) 123-45-67</p>
          </div>
          <div>
            <h4 className="text-xl font-semibold mb-2 text-vintage-warm">Социальные сети</h4>
            <p>@vintage_soul_music</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;