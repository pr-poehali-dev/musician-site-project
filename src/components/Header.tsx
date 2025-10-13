import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '@/components/ui/icon';

import CheckoutModal from './CheckoutModal';
import { CartItem } from '@/types';

interface HeaderProps {
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  showAdminLogin: boolean;
  setShowAdminLogin: (show: boolean) => void;
  adminPassword: string;
  setAdminPassword: (password: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  handleAdminLogin: () => void;
  onCheckout?: (data: { name: string; telegram: string; email?: string }) => Promise<void>;
}

const Header: React.FC<HeaderProps> = ({
  cart,
  isCartOpen,
  setIsCartOpen,
  showAdminLogin,
  setShowAdminLogin,
  adminPassword,
  setAdminPassword,
  updateQuantity,
  removeFromCart,
  getTotalPrice,
  getTotalItems,
  handleAdminLogin,
  onCheckout
}) => {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleCheckout = () => {
    if (cart.length === 0) return;
    setIsCheckoutOpen(true);
    setIsCartOpen(false);
  };
  
  const handleCheckoutSubmit = async (data: { name: string; telegram: string; email?: string }) => {
    if (onCheckout) {
      await onCheckout(data);
    }
  };
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-sm bg-vintage-cream/80 border-b border-vintage-brown/20">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 
            className="text-2xl font-bold text-vintage-warm cursor-pointer hover:text-vintage-dark-brown transition-colors"
            onClick={() => navigate('/')}
          >
            Дмитрий Шмелидзэ
          </h1>
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
                <a href="#shop" className="text-vintage-warm hover:text-vintage-dark-brown transition-colors">Магазин</a>
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
            {/* Кнопка входа в админ панель */}
            <Dialog open={showAdminLogin} onOpenChange={setShowAdminLogin}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Icon name="Settings" size={20} />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-vintage-cream border-vintage-brown/20">
                <DialogHeader>
                  <DialogTitle className="text-vintage-warm">Вход в админ панель</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="password" className="text-vintage-warm">Пароль</Label>
                    <Input 
                      id="password"
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="mt-1 border-vintage-brown/30 focus:border-vintage-dark-brown"
                      placeholder="Введите пароль"
                    />
                  </div>
                  <Button 
                    onClick={handleAdminLogin}
                    className="w-full bg-vintage-dark-brown hover:bg-vintage-warm text-vintage-cream"
                  >
                    Войти
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" className="relative">
                  <Icon name="ShoppingCart" size={24} />
                  {getTotalItems() > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-vintage-dark-brown text-vintage-cream min-w-[20px] h-5 rounded-full flex items-center justify-center text-xs">
                      {getTotalItems()}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-vintage-cream border-vintage-brown/20">
                <SheetHeader>
                  <SheetTitle className="text-vintage-warm">Корзина</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  {cart.length === 0 ? (
                    <p className="text-vintage-warm/70 text-center py-8">Корзина пуста</p>
                  ) : (
                    <>
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-vintage-brown/10 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-vintage-warm">{item.title}</h4>
                            <p className="text-sm text-vintage-warm/60 capitalize">{item.type}</p>
                            <p className="text-sm font-bold text-vintage-dark-brown">{item.price} ₽</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Icon name="Minus" size={16} />
                            </Button>
                            <span className="w-8 text-center text-vintage-warm">{item.quantity}</span>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Icon name="Plus" size={16} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Icon name="X" size={16} />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <div className="border-t border-vintage-brown/20 pt-4">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-lg font-bold text-vintage-warm">Итого:</span>
                          <span className="text-lg font-bold text-vintage-dark-brown">{getTotalPrice()} ₽</span>
                        </div>
                        <Button 
                          onClick={handleCheckout}
                          className="w-full bg-vintage-dark-brown hover:bg-vintage-warm text-vintage-cream"
                        >
                          <Icon name="CreditCard" size={20} className="mr-2" />
                          Оформить заказ
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
            <Button variant="ghost" className="md:hidden">
              <Icon name="Menu" size={24} />
            </Button>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          cart={cart}
          totalPrice={getTotalPrice()}
          onClose={() => setIsCheckoutOpen(false)}
          onSubmit={handleCheckoutSubmit}
        />
      )}
    </nav>
  );
};

export default Header;