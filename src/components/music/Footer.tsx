import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-vintage-warm text-vintage-cream py-8 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <p className="mb-4">© Shmelidze&Co Music. Все права защищены.</p>
        <p className="text-vintage-cream/70">Создано с любовью к музыке</p>
        <p className="text-vintage-cream/50 text-xs italic mt-3">© Все авторские права на песни защищены с момента их размещения на сайте (Согласно ст. 1255 ГК РФ)</p>
      </div>
    </footer>
  );
};

export default Footer;