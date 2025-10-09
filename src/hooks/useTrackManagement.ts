import { useState } from 'react';
import { Track, Album } from '@/types';

const defaultTracks: Track[] = [
  { id: "1", title: "Vintage Dreams", duration: "3:42", file: "", price: 129 },
  { id: "2", title: "Golden Memories", duration: "4:15", file: "", price: 129 },
  { id: "3", title: "Sunset Boulevard", duration: "3:28", file: "", price: 129 },
  { id: "4", title: "Old Soul", duration: "4:03", file: "", price: 129 }
];

export const useTrackManagement = (albums: Album[], setAlbums: (albums: Album[]) => void) => {
  const [tracks, setTracks] = useState<Track[]>(defaultTracks);

  const removeTrack = (trackId: string) => {
    const updatedTracks = tracks.filter(track => track.id !== trackId);
    setTracks(updatedTracks);
    
    const savedTracks = JSON.parse(localStorage.getItem('uploadedTracks') || '[]');
    const filteredSavedTracks = savedTracks.filter((track: Track) => track.id !== trackId);
    localStorage.setItem('uploadedTracks', JSON.stringify(filteredSavedTracks));
    
    const updatedAlbums = albums.map(album => ({
      ...album,
      trackList: album.trackList.filter(track => track.id !== trackId),
      tracks: album.trackList.filter(track => track.id !== trackId).length
    }));
    setAlbums(updatedAlbums);
    localStorage.setItem('albums', JSON.stringify(updatedAlbums));
    
    window.dispatchEvent(new CustomEvent('tracksUpdated'));
    window.dispatchEvent(new CustomEvent('albumsUpdated'));
  };

  const editTrack = (trackId: string, trackData: Omit<Track, 'id'>) => {
    const updatedTracks = tracks.map(track => 
      track.id === trackId 
        ? { ...track, ...trackData } 
        : track
    );
    setTracks(updatedTracks);
    
    const savedTracks = JSON.parse(localStorage.getItem('uploadedTracks') || '[]');
    const updatedSavedTracks = savedTracks.map((track: Track) => 
      track.id === trackId 
        ? { ...track, ...trackData } 
        : track
    );
    localStorage.setItem('uploadedTracks', JSON.stringify(updatedSavedTracks));
    
    const updatedAlbums = albums.map(album => ({
      ...album,
      trackList: album.trackList.map(track => 
        track.id === trackId 
          ? { ...track, ...trackData } 
          : track
      )
    }));
    setAlbums(updatedAlbums);
    localStorage.setItem('albums', JSON.stringify(updatedAlbums));
    
    window.dispatchEvent(new CustomEvent('tracksUpdated'));
    window.dispatchEvent(new CustomEvent('albumsUpdated'));
  };

  return {
    tracks,
    setTracks,
    removeTrack,
    editTrack
  };
};
