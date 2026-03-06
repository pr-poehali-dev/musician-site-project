import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { 
  migrateLocalStorageToDatabase, 
  clearLocalStorageAfterMigration, 
  restoreFromBackup,
  checkMigrationStatus 
} from '@/utils/dataMigration';

const MUSIC_API_URL = 'https://functions.poehali.dev/25aac639-cf81-4eb7-80fc-aa9a157a25e6';

const MigrationPanel: React.FC = () => {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<Record<string, unknown> | null>(null);
  const [migrationStatus, setMigrationStatus] = useState<Record<string, unknown> | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isCleaningAudio, setIsCleaningAudio] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<{deleted: number; message: string} | null>(null);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const status = await checkMigrationStatus();
      setMigrationStatus(status);
    } catch (error) {
      console.error('Ошибка проверки статуса:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleMigrate = async () => {
    if (!confirm('Вы уверены, что хотите начать миграцию данных из localStorage в базу данных?')) {
      return;
    }

    setIsMigrating(true);
    setMigrationResult(null);

    try {
      const result = await migrateLocalStorageToDatabase();
      setMigrationResult(result);
      await checkStatus();
      
      if (result.success) {
        alert(`✅ Миграция завершена!\n\nАльбомов: ${result.albumsMigrated}\nТреков: ${result.tracksMigrated}`);
      } else {
        alert(`⚠️ Миграция завершена с ошибками.\n\nПроверьте консоль для деталей.`);
      }
    } catch (error) {
      console.error('Ошибка миграции:', error);
      alert('❌ Ошибка миграции: ' + error);
    } finally {
      setIsMigrating(false);
    }
  };

  const handleClearLocalStorage = () => {
    if (!confirm('⚠️ ВНИМАНИЕ!\n\nВы уверены, что хотите очистить localStorage?\nРезервная копия будет сохранена и данные можно будет восстановить.\n\nПродолжить?')) {
      return;
    }

    const success = clearLocalStorageAfterMigration();
    if (success) {
      alert('✅ localStorage очищен. Резервная копия сохранена.');
      checkStatus();
    } else {
      alert('❌ Не удалось очистить localStorage');
    }
  };

  const handleCleanupAudio = async () => {
    if (!confirm('Удалить 115 неиспользуемых аудиофайлов из базы данных?\n\nЭто освободит ~20 МБ. Действие необратимо.')) {
      return;
    }
    setIsCleaningAudio(true);
    setCleanupResult(null);
    try {
      const res = await fetch(`${MUSIC_API_URL}?path=cleanup-audio`, { method: 'DELETE' });
      const data = await res.json();
      setCleanupResult(data);
    } catch (error) {
      setCleanupResult({ deleted: 0, message: 'Ошибка: ' + error });
    } finally {
      setIsCleaningAudio(false);
    }
  };

  const handleRestore = () => {
    if (!confirm('Восстановить данные из резервной копии?')) {
      return;
    }

    const success = restoreFromBackup();
    if (success) {
      alert('✅ Данные восстановлены из резервной копии');
      window.location.reload();
    } else {
      alert('❌ Не удалось восстановить данные');
    }
  };

  if (isChecking) {
    return (
      <Card className="bg-vintage-cream border-vintage-brown/20">
        <CardContent className="p-6 text-center">
          <Icon name="Loader2" size={32} className="animate-spin text-vintage-dark-brown mx-auto mb-2" />
          <p className="text-vintage-warm">Проверка данных...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-vintage-cream border-vintage-brown/20">
      <CardHeader>
        <CardTitle className="text-vintage-dark-brown flex items-center gap-2">
          <Icon name="Database" size={24} />
          Миграция данных в базу данных
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!migrationStatus?.needsMigration ? (
          <Alert className="bg-green-50 border-green-200">
            <Icon name="CheckCircle2" className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 ml-2">
              <strong>Миграция не требуется</strong>
              <br />
              Все данные уже синхронизированы с базой данных
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="bg-blue-50 border-blue-200">
            <Icon name="Info" className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 ml-2">
              <strong>Обнаружены данные для миграции</strong>
              <br />
              В localStorage найдены альбомы и треки, которые можно перенести в базу данных
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-vintage-brown/10 rounded-lg border border-vintage-brown/20">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="HardDrive" size={16} className="text-vintage-dark-brown" />
              <p className="text-sm font-semibold text-vintage-dark-brown">localStorage</p>
            </div>
            <div className="space-y-1 text-sm text-vintage-warm">
              <p>Альбомов: <Badge variant="outline">{migrationStatus?.localAlbumsCount || 0}</Badge></p>
              <p>Треков: <Badge variant="outline">{migrationStatus?.localTracksCount || 0}</Badge></p>
            </div>
          </div>

          <div className="p-4 bg-vintage-brown/10 rounded-lg border border-vintage-brown/20">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Database" size={16} className="text-vintage-dark-brown" />
              <p className="text-sm font-semibold text-vintage-dark-brown">База данных</p>
            </div>
            <div className="space-y-1 text-sm text-vintage-warm">
              <p>Альбомов: <Badge variant="outline">{migrationStatus?.dbAlbumsCount || 0}</Badge></p>
              <p>Треков: <Badge variant="outline">{migrationStatus?.dbTracksCount || 0}</Badge></p>
            </div>
          </div>
        </div>

        {migrationResult && (
          <Alert className={migrationResult.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
            <Icon 
              name={migrationResult.success ? "CheckCircle2" : "AlertCircle"} 
              className={`h-4 w-4 ${migrationResult.success ? "text-green-600" : "text-red-600"}`}
            />
            <AlertDescription className={migrationResult.success ? "text-green-800 ml-2" : "text-red-800 ml-2"}>
              <strong>Результат миграции:</strong>
              <br />
              Мигрировано альбомов: {migrationResult.albumsMigrated}
              <br />
              Мигрировано треков: {migrationResult.tracksMigrated}
              {migrationResult.errors.length > 0 && (
                <>
                  <br />
                  <span className="text-red-600">Ошибок: {migrationResult.errors.length}</span>
                </>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Button
            onClick={handleMigrate}
            disabled={isMigrating || !migrationStatus?.needsMigration}
            className="w-full bg-vintage-dark-brown hover:bg-vintage-warm text-vintage-cream"
          >
            {isMigrating ? (
              <>
                <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                Миграция...
              </>
            ) : (
              <>
                <Icon name="Upload" size={16} className="mr-2" />
                Мигрировать данные в БД
              </>
            )}
          </Button>

          {migrationResult?.success && (
            <Button
              onClick={handleClearLocalStorage}
              variant="outline"
              className="w-full border-vintage-brown text-vintage-dark-brown hover:bg-vintage-brown/10"
            >
              <Icon name="Trash2" size={16} className="mr-2" />
              Очистить localStorage (создать резервную копию)
            </Button>
          )}

          <Button
            onClick={handleRestore}
            variant="outline"
            className="w-full border-vintage-brown text-vintage-dark-brown hover:bg-vintage-brown/10"
          >
            <Icon name="RotateCcw" size={16} className="mr-2" />
            Восстановить из резервной копии
          </Button>

          <div className="border-t border-vintage-brown/20 pt-2 mt-2">
            <p className="text-xs text-vintage-warm mb-2 font-medium">🗑️ Очистка базы данных</p>
            <Button
              onClick={handleCleanupAudio}
              disabled={isCleaningAudio}
              variant="outline"
              className="w-full border-red-300 text-red-700 hover:bg-red-50"
            >
              {isCleaningAudio ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Удаляю...
                </>
              ) : (
                <>
                  <Icon name="Trash2" size={16} className="mr-2" />
                  Удалить неиспользуемые аудиофайлы (~115 шт, 20 МБ)
                </>
              )}
            </Button>
            {cleanupResult && (
              <p className={`text-xs mt-1 text-center ${cleanupResult.deleted > 0 ? 'text-green-700' : 'text-red-600'}`}>
                {cleanupResult.message}
              </p>
            )}
          </div>

          <Button
            onClick={checkStatus}
            variant="ghost"
            size="sm"
            className="w-full text-vintage-dark-brown"
          >
            <Icon name="RefreshCw" size={14} className="mr-2" />
            Обновить статус
          </Button>
        </div>

        <Alert className="bg-yellow-50 border-yellow-200">
          <Icon name="AlertTriangle" className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 ml-2 text-xs">
            <strong>Важно:</strong> Миграция перенесет только метаданные треков (названия, цены).
            Аудиофайлы останутся в IndexedDB браузера и не будут удалены.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default MigrationPanel;