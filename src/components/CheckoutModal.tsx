import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from '@/components/ui/icon';
import { CartItem } from '@/types';

interface CheckoutModalProps {
  cart: CartItem[];
  totalPrice: number;
  onClose: () => void;
  onSubmit: (data: { name: string; telegram: string; email?: string }) => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  cart,
  totalPrice,
  onClose,
  onSubmit
}) => {
  const [name, setName] = useState('');
  const [telegram, setTelegram] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log('🛒 CheckoutModal rendered, cart:', cart, 'totalPrice:', totalPrice);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !telegram) {
      alert('Пожалуйста, заполните имя и Telegram');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ name, telegram, email });
      onClose();
    } catch (error) {
      console.error('Ошибка оформления заказа:', error);
      alert('Ошибка оформления заказа. Попробуйте снова.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto" style={{ zIndex: 9999 }}>
      <div className="flex items-start justify-center min-h-screen p-4 pt-20">
        <Card className="bg-vintage-cream/95 border-vintage-brown/20 shadow-2xl max-w-md w-full my-8">
          <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-vintage-warm">Оформление заказа</h2>
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-vintage-warm hover:bg-vintage-brown/10"
            >
              <Icon name="X" size={24} />
            </Button>
          </div>

          <div className="mb-6">
            <h3 className="font-bold text-vintage-warm mb-3">Ваш заказ:</h3>
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-vintage-warm">
                    {item.title} {item.quantity > 1 && `x${item.quantity}`}
                  </span>
                  <span className="font-bold text-vintage-dark-brown">
                    {item.price * item.quantity} ₽
                  </span>
                </div>
              ))}
              <div className="border-t border-vintage-brown/20 pt-2 mt-2 flex justify-between">
                <span className="font-bold text-vintage-warm">Итого:</span>
                <span className="font-bold text-vintage-dark-brown text-lg">
                  {totalPrice} ₽
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-vintage-warm">
                Ваше имя *
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Иван Иванов"
                required
                className="mt-1 bg-vintage-cream border-vintage-brown/20"
              />
            </div>

            <div>
              <Label htmlFor="telegram" className="text-vintage-warm">
                Telegram username *
              </Label>
              <Input
                id="telegram"
                type="text"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="@username или username"
                required
                className="mt-1 bg-vintage-cream border-vintage-brown/20"
              />
              <p className="text-xs text-vintage-warm/60 mt-1">
                Бот отправит вам уведомление о заказе
              </p>
            </div>

            <div>
              <Label htmlFor="email" className="text-vintage-warm">
                Email (опционально)
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                className="mt-1 bg-vintage-cream border-vintage-brown/20"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 border-vintage-brown/30 text-vintage-dark-brown hover:bg-vintage-brown/10"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-vintage-warm hover:bg-vintage-brown text-vintage-cream"
              >
                {isSubmitting ? 'Оформление...' : 'Оформить заказ'}
              </Button>
            </div>
          </form>

          <div className="mt-4 p-3 bg-vintage-brown/10 rounded-lg">
            <p className="text-xs text-vintage-warm/70">
              💡 После оформления заказа наш Telegram бот отправит вам уведомление с деталями и инструкцией по оплате
            </p>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default CheckoutModal;