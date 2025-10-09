import { useEffect, useState } from 'react';
import { saveAutoBackup, shouldCreateBackup, getLastBackupDate, downloadAutoBackup } from '@/utils/trackBackup';

export const useAutoBackup = () => {
  const [showBackupNotification, setShowBackupNotification] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(null);

  useEffect(() => {
    const checkAndCreateBackup = async () => {
      if (shouldCreateBackup()) {
        await saveAutoBackup();
        setShowBackupNotification(true);
        setLastBackup(getLastBackupDate());
      } else {
        setLastBackup(getLastBackupDate());
      }
    };

    checkAndCreateBackup();

    const interval = setInterval(() => {
      checkAndCreateBackup();
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const dismissNotification = () => {
    setShowBackupNotification(false);
  };

  const handleDownloadBackup = () => {
    try {
      downloadAutoBackup();
      setShowBackupNotification(false);
    } catch (error) {
      console.error('Ошибка скачивания резервной копии:', error);
    }
  };

  return {
    showBackupNotification,
    lastBackup,
    dismissNotification,
    handleDownloadBackup
  };
};
