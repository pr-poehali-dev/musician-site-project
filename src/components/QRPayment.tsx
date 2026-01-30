import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Icon from '@/components/ui/icon';
import { CartItem } from '@/types';

interface QRPaymentProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  totalPrice: number;
  onPaymentComplete: () => void;
}

const QRPayment: React.FC<QRPaymentProps> = ({
  isOpen,
  onClose,
  cart,
  totalPrice,
  onPaymentComplete
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrGenerated, setQrGenerated] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'timeout'>('pending');

  useEffect(() => {
    if (isOpen && canvasRef.current && !qrGenerated) {
      generateQRCode();
    }
  }, [isOpen, qrGenerated]);

  const generateQRCode = async () => {
    if (!canvasRef.current) return;

    try {
      // Формируем описание заказа
      const orderDescription = cart.map(item => `${item.title} (x${item.quantity})`).join(', ');
      
      // Создаем СБП ссылку с параметрами оплаты
      const sbpPaymentData = {
        amount: totalPrice,
        currency: 'RUB',
        purpose: `Заказ музыки: ${orderDescription}`,
        payeeId: '2202200505050', // ID получателя в СБП
        orderNumber: `ORDER-${Date.now()}`,
        merchantName: 'Дмитрий Шмелидзэ - Музыка'
      };

      // Формат СБП QR-кода согласно стандарту
      const sbpQRData = `https://qr.nspk.ru/AD10009Q6U8LDU2STC9QMRR0EIM2QH20?amount=${sbpPaymentData.amount}&cur=${sbpPaymentData.currency}&payeeId=${sbpPaymentData.payeeId}&purpose=${encodeURIComponent(sbpPaymentData.purpose)}&order=${sbpPaymentData.orderNumber}`;

      await QRCode.toCanvas(canvasRef.current, sbpQRData, {
        width: 280,
        margin: 2,
        color: {
          dark: '#8B4513', // vintage-dark-brown цвет
          light: '#F5E6D3'  // vintage-cream цвет
        },
        errorCorrectionLevel: 'M'
      });

      setQrGenerated(true);

      // Симулируем проверку статуса платежа (в реальном приложении это будет API)
      setTimeout(() => {
        setPaymentStatus('timeout');
      }, 300000); // 5 минут на оплату

    } catch (error) {
      console.error('Ошибка генерации QR-кода:', error);
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentStatus('success');
    setTimeout(() => {
      onPaymentComplete();
      onClose();
      resetPayment();
    }, 2000);
  };

  const resetPayment = () => {
    setQrGenerated(false);
    setPaymentStatus('pending');
  };

  const handleClose = () => {
    onClose();
    resetPayment();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-vintage-cream border-vintage-brown/20 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-vintage-warm text-center text-2xl">
            Оплата через СБП
          </DialogTitle>
          <DialogDescription className="text-vintage-brown text-center">Отсканируйте QR-код в приложении банка</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 text-center">
          {/* Сумма к оплате */}
          <div className="bg-vintage-warm/10 p-4 rounded-lg">
            <p className="text-vintage-warm/70 text-sm">К оплате:</p>
            <p className="text-3xl font-bold text-vintage-dark-brown">{totalPrice} ₽</p>
          </div>

          {paymentStatus === 'pending' && (
            <>
              {/* QR код */}
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-lg shadow-lg">
                  <canvas ref={canvasRef} />
                </div>
              </div>

              {/* Инструкции */}
              <div className="space-y-3 text-vintage-warm/80">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-vintage-warm text-vintage-cream text-sm flex items-center justify-center font-bold">1</div>
                  <p className="text-left">Откройте приложение вашего банка</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-vintage-warm text-vintage-cream text-sm flex items-center justify-center font-bold">2</div>
                  <p className="text-left">Найдите функцию "Оплата по QR"</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-vintage-warm text-vintage-cream text-sm flex items-center justify-center font-bold">3</div>
                  <p className="text-left">Наведите камеру на QR-код</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-vintage-warm text-vintage-cream text-sm flex items-center justify-center font-bold">4</div>
                  <p className="text-left">Подтвердите платеж в приложении</p>
                </div>
              </div>

              {/* Кнопки действий */}
              <div className="flex gap-3">
                <Button 
                  onClick={handlePaymentSuccess}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Icon name="CheckCircle" size={16} className="mr-2" />
                  Оплачено
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleClose}
                  className="flex-1 border-vintage-brown/30 text-vintage-warm hover:bg-vintage-warm/10"
                >
                  Отмена
                </Button>
              </div>
            </>
          )}

          {paymentStatus === 'success' && (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <Icon name="CheckCircle" size={32} className="text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-600">Платеж успешен!</h3>
                <p className="text-vintage-warm/70">Спасибо за покупку музыки</p>
              </div>
            </div>
          )}

          {paymentStatus === 'timeout' && (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
                <Icon name="Clock" size={32} className="text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-orange-600">Время истекло</h3>
                <p className="text-vintage-warm/70">Попробуйте оформить заказ заново</p>
              </div>
              <Button 
                onClick={handleClose}
                className="w-full bg-vintage-dark-brown hover:bg-vintage-warm text-vintage-cream"
              >
                Закрыть
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRPayment;