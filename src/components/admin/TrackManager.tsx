import React, { useState } from 'react';
import { Track, Album } from '@/types';
import { saveAudioFile, generateAudioFilename, validateAudioFile } from '@/utils/fileUtils';
import AddTrackDialog from './track/AddTrackDialog';
import TrackListItem from './track/TrackListItem';
import HowToUploadGuide from './HowToUploadGuide';

interface TrackManagerProps {
  albums: Album[];
  tracks: Track[];
  onAddTrack: (albumId: string, track: Omit<Track, 'id'>) => void;
  onRemoveTrack: (trackId: string) => void;
}

const TrackManager: React.FC<TrackManagerProps> = ({
  albums,
  tracks,
  onAddTrack,
  onRemoveTrack
}) => {
  const [newTrack, setNewTrack] = useState({
    title: '',
    duration: '',
    file: '',
    price: 129,
    cover: ''
  });

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState('');
  const [showAddTrack, setShowAddTrack] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [savedFilePath, setSavedFilePath] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(Date.now());

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFileError(null);
    setSavedFilePath(null);
    
    if (!file) return;
    
    const validation = validateAudioFile(file);
    if (!validation.isValid) {
      setFileError(validation.error || 'Неподдерживаемый файл');
      return;
    }
    
    setUploadedFile(file);
    setIsUploading(true);

    const audioUrl = URL.createObjectURL(file);
    setNewTrack(prev => ({ ...prev, file: audioUrl }));

    const audio = new Audio();
    audio.src = audioUrl;
    audio.addEventListener('loadedmetadata', () => {
      const minutes = Math.floor(audio.duration / 60);
      const seconds = Math.floor(audio.duration % 60);
      const duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      setNewTrack(prev => ({ ...prev, duration }));
      setIsUploading(false);
    });

    if (!newTrack.title) {
      const fileName = file.name.replace(/\.[^/.]+$/, "");
      setNewTrack(prev => ({ ...prev, title: fileName }));
    }
  };

  const resetTrackForm = () => {
    setNewTrack({
      title: '',
      duration: '',
      file: '',
      price: 129,
      cover: ''
    });
    setUploadedFile(null);
    setIsUploading(false);
    setIsSaving(false);
    setFileError(null);
    setSavedFilePath(null);
    setCoverFile(null);
    setCoverPreview(null);
    setSelectedAlbum('');
    setFileInputKey(Date.now());
  };
  
  const handleSaveAudioFile = async () => {
    if (!uploadedFile || !newTrack.title.trim()) {
      setFileError('Необходимо загрузить файл и указать название трека');
      return;
    }
    
    setIsSaving(true);
    setFileError(null);
    
    try {
      const filename = generateAudioFilename(uploadedFile.name, newTrack.title);
      const savedPath = await saveAudioFile(uploadedFile, filename, { title: newTrack.title, duration: newTrack.duration });
      
      setNewTrack(prev => ({ ...prev, file: savedPath }));
      setSavedFilePath(savedPath);
      
      alert('Трек успешно сохранен в папку audio!');
    } catch (error) {
      console.error('Ошибка сохранения файла:', error);
      setFileError('Ошибка сохранения файла');
    } finally {
      setIsSaving(false);
    }
  };

  const saveCoverImage = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        resolve(result);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTrack = async () => {
    if (newTrack.title && newTrack.duration && newTrack.file && selectedAlbum) {
      if (!savedFilePath && uploadedFile) {
        setFileError('Необходимо сохранить аудиофайл перед добавлением трека');
        return;
      }
      
      let coverUrl = newTrack.cover;
      if (coverFile) {
        coverUrl = await saveCoverImage(coverFile);
      }
      
      onAddTrack(selectedAlbum, { ...newTrack, cover: coverUrl });
      resetTrackForm();
      setShowAddTrack(false);
    } else {
      setFileError('Заполните все обязательные поля и загрузите аудиофайл');
    }
  };

  return (
    <div>
      <HowToUploadGuide />
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-vintage-warm">Треки</h3>
        <AddTrackDialog
          open={showAddTrack}
          onOpenChange={setShowAddTrack}
          newTrack={newTrack}
          onTrackChange={setNewTrack}
          uploadedFile={uploadedFile}
          isUploading={isUploading}
          isSaving={isSaving}
          savedFilePath={savedFilePath}
          fileError={fileError}
          selectedAlbum={selectedAlbum}
          onAlbumChange={setSelectedAlbum}
          albums={albums}
          coverPreview={coverPreview}
          onFileUpload={handleFileUpload}
          onCoverUpload={handleCoverUpload}
          onSaveAudioFile={handleSaveAudioFile}
          onAddTrack={handleAddTrack}
          fileInputKey={fileInputKey}
        />
      </div>

      <div className="space-y-2">
        {tracks.map((track) => (
          <TrackListItem
            key={track.id}
            track={track}
            onRemove={onRemoveTrack}
          />
        ))}
      </div>
    </div>
  );
};

export default TrackManager;