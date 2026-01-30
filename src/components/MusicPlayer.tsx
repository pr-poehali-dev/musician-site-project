import React, { useRef, useEffect } from 'react';
import { Track } from '@/types';
import { incrementPlays } from '@/utils/trackStats';
import { convertYandexDiskUrl } from '@/utils/yandexDisk';
import FloatingPlayer from '@/components/player/FloatingPlayer';
import PlayerCard from '@/components/player/PlayerCard';

interface MusicPlayerProps {
  tracks: Track[];
  isPlaying: boolean;
  currentTrack: Track | null;
  currentTime: number;
  duration: number;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTrack: (track: Track) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  onTrackEnd?: () => void;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({
  tracks,
  isPlaying,
  currentTrack,
  currentTime,
  duration,
  setIsPlaying,
  setCurrentTrack,
  setCurrentTime,
  setDuration,
  onTrackEnd
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const [volume, setVolume] = React.useState(1);
  const [isMuted, setIsMuted] = React.useState(false);
  const [showTooltip, setShowTooltip] = React.useState(false);
  const [tooltipPosition, setTooltipPosition] = React.useState(0);
  const [tooltipTime, setTooltipTime] = React.useState(0);
  const [position, setPosition] = React.useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = React.useState(false);

  const togglePlay = () => {
    if (audioRef.current && currentTrack) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => {
          console.warn('Ошибка воспроизведения:', error);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const playNext = () => {
    const currentIndex = tracks.findIndex(track => track.id === currentTrack?.id);
    if (currentIndex < tracks.length - 1) {
      setCurrentTrack(tracks[currentIndex + 1]);
    }
  };

  const playPrevious = () => {
    const currentIndex = tracks.findIndex(track => track.id === currentTrack?.id);
    if (currentIndex > 0) {
      setCurrentTrack(tracks[currentIndex - 1]);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const updateTime = () => setCurrentTime(audio.currentTime);
      const updateDuration = () => setDuration(audio.duration);
      const handleEnded = () => {
        setIsPlaying(false);
        if (onTrackEnd) {
          onTrackEnd();
        } else {
          playNext();
        }
      };
      
      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('loadedmetadata', updateDuration);
      audio.addEventListener('ended', handleEnded);
      
      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('loadedmetadata', updateDuration);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [setCurrentTime, setDuration, onTrackEnd, playNext]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio && currentTrack?.file) {
      const loadAudio = async () => {
        try {
          let audioUrl = currentTrack.file;
          
          console.log('🎵 [MusicPlayer] Загрузка трека:', currentTrack.title, 'file:', audioUrl);
          
          // Конвертируем ссылку Яндекс.Диска в прямую ссылку на файл
          audioUrl = await convertYandexDiskUrl(audioUrl);
          
          audio.src = audioUrl;
          audio.load();
          setCurrentTime(0);
          setDuration(0);
          
          if (isPlaying) {
            audio.play().catch(error => {
              console.warn('❌ [MusicPlayer] Ошибка автовоспроизведения:', error);
              setIsPlaying(false);
            });
            
            incrementPlays(currentTrack.id);
          }
        } catch (error) {
          console.error('❌ [MusicPlayer] Ошибка загрузки аудио:', error);
          setIsPlaying(false);
        }
      };
      
      loadAudio();
    }
  }, [currentTrack, isPlaying, setCurrentTime, setDuration]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (playerRef.current && !isMinimized) {
      const rect = playerRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && playerRef.current) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      const maxX = window.innerWidth - playerRef.current.offsetWidth;
      const maxY = window.innerHeight - playerRef.current.offsetHeight;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const isPlayerActive = currentTrack && isPlaying;

  return (
    <>
      {isPlayerActive && (
        <FloatingPlayer
          playerRef={playerRef}
          position={position}
          isMinimized={isMinimized}
          isDragging={isDragging}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          isMuted={isMuted}
          tracks={tracks}
          audioRef={audioRef}
          formatTime={formatTime}
          handleMouseDown={handleMouseDown}
          setIsMinimized={setIsMinimized}
          setIsPlaying={setIsPlaying}
          setCurrentTime={setCurrentTime}
          togglePlay={togglePlay}
          playPrevious={playPrevious}
          playNext={playNext}
          toggleMute={toggleMute}
          handleVolumeChange={handleVolumeChange}
        />
      )}

      <PlayerCard
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        showTooltip={showTooltip}
        tooltipPosition={tooltipPosition}
        tooltipTime={tooltipTime}
        tracks={tracks}
        audioRef={audioRef}
        formatTime={formatTime}
        togglePlay={togglePlay}
        playPrevious={playPrevious}
        playNext={playNext}
        setCurrentTime={setCurrentTime}
        setTooltipTime={setTooltipTime}
        setTooltipPosition={setTooltipPosition}
        setShowTooltip={setShowTooltip}
        toggleMute={toggleMute}
        handleVolumeChange={handleVolumeChange}
        setCurrentTrack={setCurrentTrack}
      />
    </>
  );
};

export default MusicPlayer;