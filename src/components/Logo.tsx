import { useNavigate } from 'react-router-dom';

const Logo = () => {
  const navigate = useNavigate();

  return (
    <div 
      className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
      onClick={() => navigate('/')}
    >
      <img 
        src="https://cdn.poehali.dev/projects/43e5d54d-0b57-4be1-b3b3-e23b086ac4cc/files/50212536-b19d-49e1-8c31-c6ddcb354c79.jpg" 
        alt="Дмитрий Шмелидзэ - логотип"
        className="w-12 h-12 rounded-full object-cover"
      />
      <span className="text-xl font-bold">Дмитрий Шмелидзэ</span>
    </div>
  );
};

export default Logo;
