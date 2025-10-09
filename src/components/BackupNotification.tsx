import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface BackupNotificationProps {
  show: boolean;
  lastBackup: string | null;
  onDownload: () => void;
  onDismiss: () => void;
}

const BackupNotification: React.FC<BackupNotificationProps> = ({
  show,
  lastBackup,
  onDownload,
  onDismiss
}) => {
  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
      <Card className="bg-vintage-cream border-vintage-warm/30 shadow-2xl max-w-md">
        <div className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-vintage-warm/20 rounded-lg">
              <Icon name="Database" size={24} className="text-vintage-dark-brown" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-vintage-dark-brown mb-1">
                Создана резервная копия
              </h3>
              <p className="text-sm text-vintage-warm/70">
                Автоматическая резервная копия ваших треков готова к скачиванию.
              </p>
              {lastBackup && (
                <p className="text-xs text-vintage-warm/60 mt-1">
                  Последнее резервное копирование: {lastBackup}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="text-vintage-warm/60 hover:text-vintage-dark-brown h-8 w-8 p-0"
            >
              <Icon name="X" size={16} />
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={onDownload}
              className="flex-1 bg-vintage-dark-brown hover:bg-vintage-warm text-vintage-cream"
            >
              <Icon name="Download" size={16} className="mr-2" />
              Скачать
            </Button>
            <Button
              onClick={onDismiss}
              variant="outline"
              className="border-vintage-warm/30 text-vintage-dark-brown hover:bg-vintage-warm/10"
            >
              Позже
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BackupNotification;
