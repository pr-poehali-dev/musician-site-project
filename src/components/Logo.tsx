import { useNavigate } from 'react-router-dom';

const Logo = () => {
  const navigate = useNavigate();

  return (
    <div 
      className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
      onClick={() => navigate('/')}
    >
      <img 
        src="https://cdn.poehali.dev/files/35bf3198-6bc5-4049-9328-baf39a81cdb5.jpg" 
        alt="Shmelidze&Co - логотип"
        className="h-16 w-16 object-contain"
      />
      <span className="text-2xl font-bold text-vintage-dark-brown">Shmelidze&Co</span>
    </div>
  );
};

export default Logo;