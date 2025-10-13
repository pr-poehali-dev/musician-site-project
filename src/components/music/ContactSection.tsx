import React from 'react';

const ContactSection: React.FC = () => {
  return (
    <section id="contact" className="py-16 px-6 bg-vintage-dark-brown">
      <div className="max-w-4xl mx-auto text-center">
        <h3 className="text-4xl font-bold text-vintage-cream mb-8">Контакты</h3>
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
