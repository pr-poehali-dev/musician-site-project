/**
 * Утилита для логирования синхронизации данных
 */

interface SyncLog {
  timestamp: Date;
  action: string;
  status: 'success' | 'error' | 'pending';
  details?: string;
}

class SyncLogger {
  private logs: SyncLog[] = [];
  private maxLogs = 50;

  log(action: string, status: 'success' | 'error' | 'pending', details?: string) {
    const logEntry: SyncLog = {
      timestamp: new Date(),
      action,
      status,
      details
    };

    this.logs.unshift(logEntry);
    
    // Ограничиваем количество логов
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Выводим в консоль с красивым форматированием
    const emoji = status === 'success' ? '✅' : status === 'error' ? '❌' : '⏳';
    const time = logEntry.timestamp.toLocaleTimeString('ru-RU');
    console.log(`${emoji} [${time}] ${action}${details ? ': ' + details : ''}`);
  }

  getLogs(): SyncLog[] {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
  }

  // Специализированные методы
  logSync(itemCount: number) {
    this.log('Синхронизация', 'success', `Обновлено элементов: ${itemCount}`);
  }

  logError(action: string, error: Error) {
    this.log(action, 'error', error.message);
  }

  logOnlineStatus(isOnline: boolean) {
    this.log(
      isOnline ? 'Соединение восстановлено' : 'Соединение потеряно',
      isOnline ? 'success' : 'error'
    );
  }
}

export const syncLogger = new SyncLogger();
