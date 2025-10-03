import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Icon from '@/components/ui/icon';
import { Track, Album } from '@/types';
import { saveAudioFile, generateAudioFilename, validateAudioFile } from '@/utils/fileUtils';

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFileError(null);
    setSavedFilePath(null);
    
    if (!file) return;
    
    // Валидация файла
    const validation = validateAudioFile(file);
    if (!validation.isValid) {
      setFileError(validation.error || 'Неподдерживаемый файл');
      return;
    }
    
    setUploadedFile(file);
    setIsUploading(true);

    // Создаем URL для локального воспроизведения
    const audioUrl = URL.createObjectURL(file);
    setNewTrack(prev => ({ ...prev, file: audioUrl }));

    // Автоматически определяем длительность трека
    const audio = new Audio();
    audio.src = audioUrl;
    audio.addEventListener('loadedmetadata', () => {
      const minutes = Math.floor(audio.duration / 60);
      const seconds = Math.floor(audio.duration % 60);
      const duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      setNewTrack(prev => ({ ...prev, duration }));
      setIsUploading(false);
    });

    // Если название трека не задано, используем название файла
    if (!newTrack.title) {
      const fileName = file.name.replace(/\.[^/.]+$/, ""); // убираем расширение
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
      
      // Обновляем путь к файлу в треке
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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-vintage-warm">Треки</h3>
        <Dialog open={showAddTrack} onOpenChange={setShowAddTrack}>
          <DialogTrigger asChild>
            <Button className="bg-vintage-dark-brown hover:bg-vintage-warm text-vintage-cream">
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить трек
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-vintage-cream border-vintage-brown/20">
            <DialogHeader>
              <DialogTitle className="text-vintage-warm">Новый трек</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="track-title" className="text-vintage-warm">Название</Label>
                <Input
                  id="track-title"
                  value={newTrack.title}
                  onChange={(e) => setNewTrack({...newTrack, title: e.target.value})}
                  placeholder="Название трека"
                  className="border-vintage-brown/30 focus:border-vintage-dark-brown"
                />
              </div>
              <div>
                <Label htmlFor="track-duration" className="text-vintage-warm">Длительность</Label>
                <Input
                  id="track-duration"
                  value={newTrack.duration}
                  onChange={(e) => setNewTrack({...newTrack, duration: e.target.value})}
                  placeholder="3:42"
                  className="border-vintage-brown/30 focus:border-vintage-dark-brown"
                />
              </div>
              <div>
                <Label className="text-vintage-warm">Аудиофайл</Label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="w-full px-3 py-2 border border-vintage-brown/30 rounded-md focus:border-vintage-dark-brown bg-vintage-cream file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-vintage-dark-brown file:text-vintage-cream hover:file:bg-vintage-warm"
                  />
                  {uploadedFile && (
                    <div className="flex items-center gap-2 p-2 bg-vintage-brown/10 rounded">
                      <Icon name="Music" size={16} className="text-vintage-dark-brown" />
                      <div className="flex-1">
                        <span className="text-sm text-vintage-warm block">{uploadedFile.name}</span>
                        {isUploading && (
                          <span className="text-xs text-vintage-warm/60">Обработка...</span>
                        )}
                        {savedFilePath && (
                          <div className="flex items-center gap-1 mt-1">
                            <Icon name="CheckCircle" size={12} className="text-green-600" />
                            <span className="text-xs text-green-600">Сохранено: {savedFilePath}</span>
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={handleSaveAudioFile}
                        disabled={!uploadedFile || !newTrack.title.trim() || isSaving || savedFilePath !== null}
                        variant="outline"
                        size="sm"
                        className="border-vintage-dark-brown text-vintage-dark-brown hover:bg-vintage-dark-brown hover:text-vintage-cream"
                      >
                        {isSaving ? (
                          <>
                            <Icon name="Loader2" size={14} className="mr-1 animate-spin" />
                            Сохраняем
                          </>
                        ) : savedFilePath ? (
                          <>
                            <Icon name="CheckCircle" size={14} className="mr-1" />
                            Сохранено
                          </>
                        ) : (
                          <>
                            <Icon name="Save" size={14} className="mr-1" />
                            Сохранить
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-vintage-warm">Обложка трека (необязательно)</Label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="w-full px-3 py-2 border border-vintage-brown/30 rounded-md focus:border-vintage-dark-brown bg-vintage-cream file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-vintage-dark-brown file:text-vintage-cream hover:file:bg-vintage-warm"
                  />
                  {coverPreview && (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-vintage-brown/20">
                      <img src={coverPreview} alt="Обложка" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="track-price" className="text-vintage-warm">Цена (₽)</Label>
                <Input
                  id="track-price"
                  type="number"
                  value={newTrack.price}
                  onChange={(e) => setNewTrack({...newTrack, price: Number(e.target.value)})}
                  placeholder="129"
                  className="border-vintage-brown/30 focus:border-vintage-dark-brown"
                />
              </div>
              <div>
                <Label htmlFor="track-album" className="text-vintage-warm">Альбом (необязательно)</Label>
                <select
                  id="track-album"
                  value={selectedAlbum}
                  onChange={(e) => setSelectedAlbum(e.target.value)}
                  className="w-full px-3 py-2 border border-vintage-brown/30 rounded-md focus:border-vintage-dark-brown bg-vintage-cream"
                >
                  <option value="">Без альбома</option>
                  {albums.map((album) => (
                    <option key={album.id} value={album.id}>
                      {album.title}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Ошибки валидации */}
              {fileError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <Icon name="AlertCircle" size={16} className="text-red-600" />
                  <span className="text-sm text-red-600">{fileError}</span>
                </div>
              )}
              
              <Button 
                onClick={handleAddTrack}
                disabled={!newTrack.title || !newTrack.duration || !newTrack.file || !selectedAlbum}
                className="w-full bg-vintage-dark-brown hover:bg-vintage-warm text-vintage-cream disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Добавить трек
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {tracks.map((track) => (
          <div 
            key={track.id}
            className="flex items-center justify-between p-3 bg-vintage-brown/10 rounded-lg"
          >
            <div className="flex items-center gap-3">
              {track.cover ? (
                <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                  <img src={track.cover} alt={track.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-12 h-12 bg-vintage-dark-brown/20 rounded flex items-center justify-center flex-shrink-0">
                  <Icon name="Music" size={20} className="text-vintage-dark-brown" />
                </div>
              )}
              <div>
                <p className="font-medium text-vintage-warm">{track.title}</p>
                <p className="text-sm text-vintage-warm/60">{track.duration}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-vintage-dark-brown">{track.price} ₽</span>
              <Button 
                onClick={() => onRemoveTrack(track.id)}
                variant="outline"
                size="sm"
                className="text-red-500 border-red-300 hover:bg-red-50"
              >
                <Icon name="Trash2" size={14} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrackManager;