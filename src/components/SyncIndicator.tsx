import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Check } from 'lucide-react';

interface SyncIndicatorProps {
  isOnline: boolean;
  lastSyncTime: Date | null;
}

const SyncIndicator = ({ isOnline, lastSyncTime }: SyncIndicatorProps) => {
  const [showIndicator, setShowIndicator] = useState(false);
  const [prevOnlineState, setPrevOnlineState] = useState(isOnline);

  // Показываем индикатор при изменении статуса
  useEffect(() => {
    if (prevOnlineState !== isOnline) {
      setShowIndicator(true);
      setPrevOnlineState(isOnline);
      
      // Скрываем через 3 секунды если вернулись онлайн
      if (isOnline) {
        setTimeout(() => {
          setShowIndicator(false);
        }, 3000);
      }
    }
  }, [isOnline, prevOnlineState]);

  // Показываем индикатор при первой синхронизации
  useEffect(() => {
    if (lastSyncTime) {
      setShowIndicator(true);
      setTimeout(() => {
        setShowIndicator(false);
      }, 2000);
    }
  }, [lastSyncTime]);

  // Всегда показываем если офлайн
  const shouldShow = !isOnline || showIndicator;

  if (!shouldShow) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className={`
        flex items-center gap-2 px-3 py-2 rounded-full shadow-lg
        backdrop-blur-md transition-all duration-300 border
        ${isOnline 
          ? 'bg-green-500/95 text-white border-green-600' 
          : 'bg-red-500/95 text-white border-red-600'
        }
      `}>
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4" />
            <Check className="w-3 h-3" />
            <span className="text-xs font-medium">
              Синхронизировано
            </span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span className="text-xs font-medium">
              Офлайн режим
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default SyncIndicator;