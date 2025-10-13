import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from '@/components/ui/icon';
import { CartItem } from '@/types';
import QRCode from 'qrcode';

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
  const [step, setStep] = useState<'form' | 'payment'>('form');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  console.log('🛒 CheckoutModal rendered, cart:', cart, 'totalPrice:', totalPrice);

  useEffect(() => {
    if (step === 'payment' && canvasRef.current) {
      generateQRCode();
    }
  }, [step]);

  const generateQRCode = async () => {
    if (!canvasRef.current) return;

    try {
      const orderDescription = cart.map(item => `${item.title} (x${item.quantity})`).join(', ');
      
      const sbpPaymentData = {
        amount: totalPrice,
        currency: 'RUB',
        purpose: `Заказ музыки: ${orderDescription}`,
        payeeId: '2202200505050',
        orderNumber: `ORDER-${Date.now()}`,
        merchantName: 'Дмитрий Шмелидзэ - Музыка'
      };

      const sbpQRData = `https://qr.nspk.ru/AD10009Q6U8LDU2STC9QMRR0EIM2QH20?amount=${sbpPaymentData.amount}&cur=${sbpPaymentData.currency}&payeeId=${sbpPaymentData.payeeId}&purpose=${encodeURIComponent(sbpPaymentData.purpose)}&order=${sbpPaymentData.orderNumber}`;

      await QRCode.toCanvas(canvasRef.current, sbpQRData, {
        width: 280,
        margin: 2,
        color: {
          dark: '#8B4513',
          light: '#F5E6D3'
        },
        errorCorrectionLevel: 'M'
      });
    } catch (error) {
      console.error('Ошибка генерации QR-кода:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !telegram) {
      alert('Пожалуйста, заполните имя и Telegram');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ name, telegram, email });
      setStep('payment');
    } catch (error) {
      console.error('Ошибка оформления заказа:', error);
      alert('Ошибка оформления заказа. Попробуйте снова.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
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

          {step === 'form' && (
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
            
            <div className="mt-4 p-3 bg-vintage-brown/10 rounded-lg">
              <p className="text-xs text-vintage-warm/70">
                💡 После оформления заказа вы увидите QR-код для оплаты через СБП
              </p>
            </div>
          </form>
          )}

          {step === 'payment' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-vintage-warm mb-2">Оплата через СБП</h3>
                <div className="bg-vintage-warm/10 p-4 rounded-lg">
                  <p className="text-vintage-warm/70 text-sm">К оплате:</p>
                  <p className="text-3xl font-bold text-vintage-dark-brown">{totalPrice} ₽</p>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-lg shadow-lg">
                  <canvas ref={canvasRef} />
                </div>
              </div>

              <div className="space-y-3 text-vintage-warm/80">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-vintage-warm text-vintage-cream text-sm flex items-center justify-center font-bold">1</div>
                  <p className="text-left text-sm">Откройте приложение вашего банка</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-vintage-warm text-vintage-cream text-sm flex items-center justify-center font-bold">2</div>
                  <p className="text-left text-sm">Найдите функцию "Оплата по QR"</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-vintage-warm text-vintage-cream text-sm flex items-center justify-center font-bold">3</div>
                  <p className="text-left text-sm">Наведите камеру на QR-код</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-vintage-warm text-vintage-cream text-sm flex items-center justify-center font-bold">4</div>
                  <p className="text-left text-sm">Подтвердите платеж</p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  📱 После оплаты я проверю платёж и отправлю файлы на ваш Telegram: <strong>@{telegram.replace('@', '')}</strong>
                </p>
              </div>

              <Button
                onClick={onClose}
                className="w-full bg-vintage-warm hover:bg-vintage-brown text-vintage-cream"
              >
                Закрыть
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default CheckoutModal;