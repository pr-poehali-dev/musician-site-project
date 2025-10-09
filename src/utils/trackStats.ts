import { Track, Album } from '@/types';

interface TrackStats {
  trackId: string;
  downloads: number;
  plays: number;
  lastPlayed?: string;
  lastDownloaded?: string;
}

interface StatsData {
  tracks: Record<string, TrackStats>;
  totalDownloads: number;
  totalPlays: number;
}

const STATS_KEY = 'trackStats';

const getStats = (): StatsData => {
  try {
    const data = localStorage.getItem(STATS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Ошибка загрузки статистики:', error);
  }
  
  return {
    tracks: {},
    totalDownloads: 0,
    totalPlays: 0
  };
};

const saveStats = (stats: StatsData): void => {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Ошибка сохранения статистики:', error);
  }
};

export const incrementDownloads = (trackId: string): void => {
  const stats = getStats();
  
  if (!stats.tracks[trackId]) {
    stats.tracks[trackId] = {
      trackId,
      downloads: 0,
      plays: 0
    };
  }
  
  stats.tracks[trackId].downloads += 1;
  stats.tracks[trackId].lastDownloaded = new Date().toISOString();
  stats.totalDownloads += 1;
  
  saveStats(stats);
  console.log(`📥 Скачивание трека ${trackId}: ${stats.tracks[trackId].downloads} раз`);
};

export const incrementPlays = (trackId: string): void => {
  const stats = getStats();
  
  if (!stats.tracks[trackId]) {
    stats.tracks[trackId] = {
      trackId,
      downloads: 0,
      plays: 0
    };
  }
  
  stats.tracks[trackId].plays += 1;
  stats.tracks[trackId].lastPlayed = new Date().toISOString();
  stats.totalPlays += 1;
  
  saveStats(stats);
  console.log(`▶️ Воспроизведение трека ${trackId}: ${stats.tracks[trackId].plays} раз`);
};

export const getTrackStats = (trackId: string): TrackStats | null => {
  const stats = getStats();
  return stats.tracks[trackId] || null;
};

export const getAllStats = (): StatsData => {
  return getStats();
};

export const getTopTracks = (tracks: Track[], limit: number = 10): (Track & TrackStats)[] => {
  const stats = getStats();
  
  const tracksWithStats = tracks.map(track => ({
    ...track,
    ...(stats.tracks[track.id] || { downloads: 0, plays: 0, trackId: track.id })
  }));
  
  return tracksWithStats
    .sort((a, b) => (b.downloads + b.plays * 0.5) - (a.downloads + a.plays * 0.5))
    .slice(0, limit);
};

export const enrichTracksWithStats = (tracks: Track[]): (Track & { downloads: number; plays: number })[] => {
  const stats = getStats();
  
  return tracks.map(track => ({
    ...track,
    downloads: stats.tracks[track.id]?.downloads || 0,
    plays: stats.tracks[track.id]?.plays || 0
  }));
};

export const enrichAlbumsWithStats = (albums: Album[]): Album[] => {
  const stats = getStats();
  
  return albums.map(album => ({
    ...album,
    trackList: album.trackList.map(track => ({
      ...track,
      downloads: stats.tracks[track.id]?.downloads || 0,
      plays: stats.tracks[track.id]?.plays || 0
    }))
  }));
};

export const resetStats = (): void => {
  const emptyStats: StatsData = {
    tracks: {},
    totalDownloads: 0,
    totalPlays: 0
  };
  saveStats(emptyStats);
  console.log('🔄 Статистика сброшена');
};

export const exportStats = (): void => {
  const stats = getStats();
  const jsonString = JSON.stringify(stats, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `track-stats-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  console.log('📊 Статистика экспортирована');
};
