import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import Icon from '@/components/ui/icon';

interface ArtistHeaderProps {
  user: any;
  onDashboardClick: () => void;
  onAuthClick: () => void;
}

const ArtistHeader = ({ user, onDashboardClick, onAuthClick }: ArtistHeaderProps) => {
  return (
    <header className="p-6 backdrop-blur-sm bg-vintage-cream/80 border-b border-vintage-brown/20">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Logo />
        <div className="flex gap-3">
          {user ? (
            <Button 
              variant="outline"
              className="border-vintage-brown/30 text-vintage-brown hover:bg-vintage-brown hover:text-vintage-cream"
              onClick={onDashboardClick}
            >
              <Icon name="LayoutDashboard" size={16} className="mr-2" />
              Панель управления
            </Button>
          ) : (
            <Button 
              variant="outline"
              className="border-vintage-brown/30 text-vintage-brown hover:bg-vintage-brown hover:text-vintage-cream"
              onClick={onAuthClick}
            >
              <Icon name="LogIn" size={16} className="mr-2" />
              Вход
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default ArtistHeader;
