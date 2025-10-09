import { musicApi } from './musicApi';
import { Album, Track } from '@/types';

interface MigrationResult {
  success: boolean;
  albumsMigrated: number;
  tracksMigrated: number;
  errors: string[];
}

export const migrateLocalStorageToDatabase = async (): Promise<MigrationResult> => {
  const result: MigrationResult = {
    success: true,
    albumsMigrated: 0,
    tracksMigrated: 0,
    errors: []
  };

  try {
    console.log('🔄 Начало миграции данных из localStorage в БД...');

    const localAlbums = localStorage.getItem('albums');
    const localTracks = localStorage.getItem('uploadedTracks');

    if (!localAlbums && !localTracks) {
      console.log('ℹ️ Нет данных для миграции в localStorage');
      return result;
    }

    const dbAlbums = await musicApi.getAlbums();
    console.log(`📊 В базе данных уже есть ${dbAlbums.length} альбомов`);

    if (localAlbums) {
      try {
        const albums: Album[] = JSON.parse(localAlbums);
        console.log(`📦 Найдено ${albums.length} альбомов в localStorage`);

        for (const album of albums) {
          try {
            const existsInDb = dbAlbums.find(a => a.id === album.id || a.title === album.title);
            
            if (!existsInDb) {
              console.log(`➕ Миграция альбома: ${album.title}`);
              
              const albumToMigrate = {
                title: album.title,
                artist: album.artist,
                cover: album.cover || '',
                price: album.price || 0,
                description: album.description || '',
                tracks: album.tracks || 0,
                trackList: []
              };

              await musicApi.createAlbum(albumToMigrate);
              result.albumsMigrated++;

              if (album.trackList && album.trackList.length > 0) {
                console.log(`  📝 Миграция ${album.trackList.length} треков из альбома...`);
                
                const createdAlbums = await musicApi.getAlbums();
                const createdAlbum = createdAlbums.find(a => a.title === album.title);
                
                if (createdAlbum) {
                  for (const track of album.trackList) {
                    try {
                      await musicApi.createTrack({
                        albumId: createdAlbum.id,
                        title: track.title,
                        duration: track.duration,
                        file: track.file || '',
                        price: track.price || 0,
                        cover: track.cover || ''
                      });
                      result.tracksMigrated++;
                      console.log(`    ✅ Трек: ${track.title}`);
                    } catch (error) {
                      const errorMsg = `Ошибка миграции трека ${track.title}: ${error}`;
                      console.error(`    ❌ ${errorMsg}`);
                      result.errors.push(errorMsg);
                    }
                  }
                }
              }
            } else {
              console.log(`⏭️ Альбом "${album.title}" уже существует в БД, пропускаем`);
            }
          } catch (error) {
            const errorMsg = `Ошибка миграции альбома ${album.title}: ${error}`;
            console.error(`❌ ${errorMsg}`);
            result.errors.push(errorMsg);
          }
        }
      } catch (error) {
        const errorMsg = `Ошибка парсинга альбомов: ${error}`;
        console.error(errorMsg);
        result.errors.push(errorMsg);
      }
    }

    if (localTracks) {
      try {
        const tracks: Track[] = JSON.parse(localTracks);
        console.log(`🎵 Найдено ${tracks.length} отдельных треков в localStorage`);

        const allDbAlbums = await musicApi.getAlbums();

        for (const track of tracks) {
          try {
            const albumInDb = allDbAlbums.find(a => a.id === track.albumId);
            
            if (albumInDb) {
              const trackExistsInAlbum = albumInDb.trackList?.some(t => 
                t.title === track.title && t.duration === track.duration
              );

              if (!trackExistsInAlbum) {
                console.log(`➕ Миграция трека: ${track.title} в альбом ${albumInDb.title}`);
                await musicApi.createTrack({
                  albumId: albumInDb.id,
                  title: track.title,
                  duration: track.duration,
                  file: track.file || '',
                  price: track.price || 0,
                  cover: track.cover || ''
                });
                result.tracksMigrated++;
              }
            } else {
              console.warn(`⚠️ Альбом для трека "${track.title}" не найден в БД`);
            }
          } catch (error) {
            const errorMsg = `Ошибка миграции трека ${track.title}: ${error}`;
            console.error(`❌ ${errorMsg}`);
            result.errors.push(errorMsg);
          }
        }
      } catch (error) {
        const errorMsg = `Ошибка парсинга треков: ${error}`;
        console.error(errorMsg);
        result.errors.push(errorMsg);
      }
    }

    if (result.errors.length > 0) {
      result.success = false;
    }

    console.log('\n✅ Миграция завершена!');
    console.log(`📊 Результаты:`);
    console.log(`  - Альбомов мигрировано: ${result.albumsMigrated}`);
    console.log(`  - Треков мигрировано: ${result.tracksMigrated}`);
    console.log(`  - Ошибок: ${result.errors.length}`);

    if (result.success && (result.albumsMigrated > 0 || result.tracksMigrated > 0)) {
      console.log('\n🔒 Создание резервной копии localStorage перед очисткой...');
      const backup = {
        albums: localAlbums,
        tracks: localTracks,
        timestamp: new Date().toISOString(),
        migrationResult: result
      };
      localStorage.setItem('migration_backup', JSON.stringify(backup));
      
      console.log('✅ Резервная копия сохранена в migration_backup');
      console.log('ℹ️ localStorage данные можно очистить вручную после проверки');
    }

    return result;

  } catch (error) {
    console.error('❌ Критическая ошибка миграции:', error);
    result.success = false;
    result.errors.push(`Критическая ошибка: ${error}`);
    return result;
  }
};

export const clearLocalStorageAfterMigration = () => {
  const backup = localStorage.getItem('migration_backup');
  
  if (!backup) {
    console.warn('⚠️ Нет резервной копии миграции. Очистка отменена.');
    return false;
  }

  try {
    const backupData = JSON.parse(backup);
    console.log('🗑️ Очистка localStorage после успешной миграции...');
    console.log(`📊 Резервная копия от: ${backupData.timestamp}`);
    
    localStorage.removeItem('albums');
    localStorage.removeItem('uploadedTracks');
    
    console.log('✅ localStorage очищен. Резервная копия сохранена в migration_backup');
    return true;
  } catch (error) {
    console.error('❌ Ошибка очистки localStorage:', error);
    return false;
  }
};

export const restoreFromBackup = () => {
  const backup = localStorage.getItem('migration_backup');
  
  if (!backup) {
    console.error('❌ Резервная копия не найдена');
    return false;
  }

  try {
    const backupData = JSON.parse(backup);
    
    if (backupData.albums) {
      localStorage.setItem('albums', backupData.albums);
    }
    if (backupData.tracks) {
      localStorage.setItem('uploadedTracks', backupData.tracks);
    }
    
    console.log('✅ Данные восстановлены из резервной копии');
    console.log(`📊 Дата резервной копии: ${backupData.timestamp}`);
    return true;
  } catch (error) {
    console.error('❌ Ошибка восстановления из резервной копии:', error);
    return false;
  }
};

export const checkMigrationStatus = async (): Promise<{
  needsMigration: boolean;
  localAlbumsCount: number;
  localTracksCount: number;
  dbAlbumsCount: number;
  dbTracksCount: number;
}> => {
  const localAlbums = localStorage.getItem('albums');
  const localTracks = localStorage.getItem('uploadedTracks');
  
  const localAlbumsCount = localAlbums ? JSON.parse(localAlbums).length : 0;
  const localTracksCount = localTracks ? JSON.parse(localTracks).length : 0;
  
  const dbAlbums = await musicApi.getAlbums();
  const dbAlbumsCount = dbAlbums.length;
  const dbTracksCount = dbAlbums.reduce((sum, album) => sum + (album.trackList?.length || 0), 0);
  
  const needsMigration = (localAlbumsCount > 0 || localTracksCount > 0) && 
                         (localAlbumsCount > dbAlbumsCount || localTracksCount > dbTracksCount);
  
  return {
    needsMigration,
    localAlbumsCount,
    localTracksCount,
    dbAlbumsCount,
    dbTracksCount
  };
};
