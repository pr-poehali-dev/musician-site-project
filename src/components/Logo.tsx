import { useNavigate } from 'react-router-dom';

const Logo = () => {
  const navigate = useNavigate();

  return (
    <div 
      className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
      onClick={() => navigate('/')}
    >
      <img 
        src="https://cdn.poehali.dev/files/525134cd-28d4-4400-b745-442ff0cdde5d.jpg" 
        alt="Shmelidze&Co - логотип"
        className="h-16 w-auto object-contain"
      />
    </div>
  );
};

export default Logo;