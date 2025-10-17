import { useNavigate } from 'react-router-dom';

const Logo = () => {
  const navigate = useNavigate();

  return (
    <div 
      className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
      onClick={() => navigate('/')}
    >
      <img 
        src="https://cdn.poehali.dev/files/35bf3198-6bc5-4049-9328-baf39a81cdb5.jpg" 
        alt="Shmelidze&Co - логотип"
        className="h-14 w-14 md:h-16 md:w-16 object-contain"
      />
      <span className="text-xl md:text-3xl font-bold bg-gradient-to-r from-vintage-warm via-vintage-brown to-vintage-dark-brown bg-clip-text text-transparent tracking-tight">Shmelidze&Co</span>
    </div>
  );
};

export default Logo;