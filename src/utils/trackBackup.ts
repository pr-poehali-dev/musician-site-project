import { Album, Track } from '@/types';
import { getAllAudioFiles } from '@/utils/audioStorage';

interface BackupData {
  albums: Album[];
  tracks: Track[];
  audioFiles: {
    id: string;
    filename: string;
    data: string;
  }[];
  exportDate: string;
  version: string;
}

export const exportTracksBackup = async (): Promise<void> => {
  try {
    const albumsData = localStorage.getItem('albums');
    const tracksData = localStorage.getItem('uploadedTracks');
    
    const albums: Album[] = albumsData ? JSON.parse(albumsData) : [];
    const tracks: Track[] = tracksData ? JSON.parse(tracksData) : [];
    
    const audioFiles = await getAllAudioFiles();
    const audioFilesData = await Promise.all(
      audioFiles.map(async (file) => {
        const blob = file.blob;
        const base64 = await blobToBase64(blob);
        return {
          id: file.id,
          filename: file.filename,
          data: base64
        };
      })
    );
    
    const backup: BackupData = {
      albums,
      tracks,
      audioFiles: audioFilesData,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const jsonString = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `music-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('✅ Резервная копия успешно экспортирована');
  } catch (error) {
    console.error('❌ Ошибка при экспорте резервной копии:', error);
    throw error;
  }
};

export const importTracksBackup = async (file: File): Promise<void> => {
  try {
    const text = await file.text();
    const backup: BackupData = JSON.parse(text);
    
    if (!backup.albums || !backup.version) {
      throw new Error('Неверный формат файла резервной копии');
    }
    
    localStorage.setItem('albums', JSON.stringify(backup.albums));
    
    if (backup.tracks) {
      localStorage.setItem('uploadedTracks', JSON.stringify(backup.tracks));
    }
    
    if (backup.audioFiles && backup.audioFiles.length > 0) {
      const { saveAudioToIndexedDB } = await import('@/utils/audioStorage');
      
      for (const audioFile of backup.audioFiles) {
        try {
          const blob = await base64ToBlob(audioFile.data);
          const file = new File([blob], audioFile.filename, { type: blob.type });
          await saveAudioToIndexedDB(file, audioFile.filename);
        } catch (error) {
          console.warn(`Не удалось восстановить аудиофайл ${audioFile.filename}:`, error);
        }
      }
    }
    
    window.dispatchEvent(new CustomEvent('albumsUpdated'));
    window.dispatchEvent(new CustomEvent('tracksUpdated'));
    
    console.log('✅ Резервная копия успешно импортирована');
  } catch (error) {
    console.error('❌ Ошибка при импорте резервной копии:', error);
    throw error;
  }
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      resolve(base64.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const base64ToBlob = async (base64: string): Promise<Blob> => {
  const response = await fetch(`data:audio/mpeg;base64,${base64}`);
  return await response.blob();
};

export const getBackupSize = (): string => {
  let totalSize = 0;
  
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      totalSize += localStorage[key].length + key.length;
    }
  }
  
  const sizeInKB = totalSize / 1024;
  const sizeInMB = sizeInKB / 1024;
  
  if (sizeInMB > 1) {
    return `${sizeInMB.toFixed(2)} МБ`;
  }
  return `${sizeInKB.toFixed(2)} КБ`;
};

export const createAutoBackup = async (): Promise<BackupData | null> => {
  try {
    const albumsData = localStorage.getItem('albums');
    const tracksData = localStorage.getItem('uploadedTracks');
    
    const albums: Album[] = albumsData ? JSON.parse(albumsData) : [];
    const tracks: Track[] = tracksData ? JSON.parse(tracksData) : [];
    
    if (albums.length === 0) {
      return null;
    }
    
    const backup: BackupData = {
      albums,
      tracks,
      audioFiles: [],
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    return backup;
  } catch (error) {
    console.error('❌ Ошибка создания автоматической резервной копии:', error);
    return null;
  }
};

export const saveAutoBackup = async (): Promise<void> => {
  try {
    const backup = await createAutoBackup();
    if (!backup) return;
    
    const jsonString = JSON.stringify(backup);
    localStorage.setItem('autoBackup', jsonString);
    localStorage.setItem('lastBackupDate', new Date().toISOString());
    
    console.log('✅ Автоматическая резервная копия сохранена');
  } catch (error) {
    console.error('❌ Ошибка сохранения автоматической резервной копии:', error);
  }
};

export const downloadAutoBackup = (): void => {
  try {
    const backupData = localStorage.getItem('autoBackup');
    if (!backupData) {
      throw new Error('Резервная копия не найдена');
    }
    
    const blob = new Blob([backupData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `auto-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('✅ Автоматическая резервная копия скачана');
  } catch (error) {
    console.error('❌ Ошибка скачивания автоматической резервной копии:', error);
    throw error;
  }
};

export const shouldCreateBackup = (): boolean => {
  const lastBackupDate = localStorage.getItem('lastBackupDate');
  if (!lastBackupDate) return true;
  
  const lastBackup = new Date(lastBackupDate);
  const now = new Date();
  const diffInHours = (now.getTime() - lastBackup.getTime()) / (1000 * 60 * 60);
  
  return diffInHours >= 24;
};

export const getLastBackupDate = (): string | null => {
  const lastBackupDate = localStorage.getItem('lastBackupDate');
  if (!lastBackupDate) return null;
  
  const date = new Date(lastBackupDate);
  return date.toLocaleString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};