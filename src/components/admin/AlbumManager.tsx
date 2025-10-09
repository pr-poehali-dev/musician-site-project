import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Icon from '@/components/ui/icon';
import { Track, Album } from '@/types';

interface AlbumManagerProps {
  albums: Album[];
  onAddAlbum: (album: Omit<Album, 'id'>) => void;
  onEditAlbum: (albumId: string, albumData: Omit<Album, 'id'>) => void;
  onRemoveAlbum: (albumId: string) => void;
  onRemoveTrack?: (trackId: string) => void;
}

const AlbumManager: React.FC<AlbumManagerProps> = ({
  albums,
  onAddAlbum,
  onEditAlbum,
  onRemoveAlbum,
  onRemoveTrack
}) => {
  const [expandedAlbums, setExpandedAlbums] = useState<string[]>([]);
  const [newAlbum, setNewAlbum] = useState({
    title: '',
    artist: '',
    cover: '',
    price: 0,
    description: ''
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [showAddAlbum, setShowAddAlbum] = useState(false);
  const [showEditAlbum, setShowEditAlbum] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [editAlbumData, setEditAlbumData] = useState({
    title: '',
    artist: '',
    cover: '',
    price: 0,
    description: ''
  });
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null);
  const [editCoverPreview, setEditCoverPreview] = useState<string | null>(null);

  const handleAddAlbum = async () => {
    if (newAlbum.title && newAlbum.artist) {
      let coverUrl = newAlbum.cover;
      
      if (coverFile) {
        coverUrl = await saveCoverImage(coverFile);
      }
      
      onAddAlbum({
        ...newAlbum,
        cover: coverUrl,
        tracks: 0,
        trackList: []
      });
      setNewAlbum({
        title: '',
        artist: '',
        cover: '',
        price: 0,
        description: ''
      });
      setCoverFile(null);
      setCoverPreview(null);
      setShowAddAlbum(false);
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

  const handleEditAlbum = (album: Album) => {
    setEditingAlbum(album);
    setEditAlbumData({
      title: album.title,
      artist: album.artist,
      cover: album.cover,
      price: album.price,
      description: album.description
    });
    setEditCoverPreview(album.cover || null);
    setShowEditAlbum(true);
  };

  const handleEditCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setEditCoverFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditCoverPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEditAlbum = async () => {
    if (editingAlbum && editAlbumData.title && editAlbumData.artist) {
      let coverUrl = editAlbumData.cover;
      
      if (editCoverFile) {
        coverUrl = await saveCoverImage(editCoverFile);
      }
      
      onEditAlbum(editingAlbum.id, {
        ...editAlbumData,
        cover: coverUrl,
        tracks: editingAlbum.tracks,
        trackList: editingAlbum.trackList
      });
      setShowEditAlbum(false);
      setEditingAlbum(null);
      setEditAlbumData({
        title: '',
        artist: '',
        cover: '',
        price: 0,
        description: ''
      });
      setEditCoverFile(null);
      setEditCoverPreview(null);
    }
  };

  const handleDeleteAlbum = (albumId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот альбом?')) {
      onRemoveAlbum(albumId);
    }
  };

  const handleDeleteTrack = (trackId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот трек?')) {
      onRemoveTrack?.(trackId);
    }
  };

  const toggleAlbumExpanded = (albumId: string) => {
    setExpandedAlbums(prev => 
      prev.includes(albumId) 
        ? prev.filter(id => id !== albumId)
        : [...prev, albumId]
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-vintage-warm">Альбомы</h3>
        <Dialog open={showAddAlbum} onOpenChange={setShowAddAlbum}>
          <DialogTrigger asChild>
            <Button className="bg-vintage-dark-brown hover:bg-vintage-warm text-vintage-cream">
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить альбом
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-vintage-cream border-vintage-brown/20">
            <DialogHeader>
              <DialogTitle className="text-vintage-warm">Новый альбом</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="album-title" className="text-vintage-warm">Название</Label>
                <Input
                  id="album-title"
                  value={newAlbum.title}
                  onChange={(e) => setNewAlbum({...newAlbum, title: e.target.value})}
                  placeholder="Название альбома"
                  className="border-vintage-brown/30 focus:border-vintage-dark-brown"
                />
              </div>
              <div>
                <Label htmlFor="album-artist" className="text-vintage-warm">Исполнитель</Label>
                <Input
                  id="album-artist"
                  value={newAlbum.artist}
                  onChange={(e) => setNewAlbum({...newAlbum, artist: e.target.value})}
                  placeholder="Имя исполнителя"
                  className="border-vintage-brown/30 focus:border-vintage-dark-brown"
                />
              </div>
              <div>
                <Label htmlFor="album-cover" className="text-vintage-warm">Обложка</Label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="w-full px-3 py-2 border border-vintage-brown/30 rounded-md focus:border-vintage-dark-brown bg-vintage-cream file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-vintage-dark-brown file:text-vintage-cream hover:file:bg-vintage-warm"
                  />
                  {coverPreview && (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-vintage-brown/20">
                      <img src={coverPreview} alt="Предпросмотр" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="text-sm text-vintage-warm/60">или</div>
                  <Input
                    id="album-cover"
                    value={newAlbum.cover}
                    onChange={(e) => setNewAlbum({...newAlbum, cover: e.target.value})}
                    placeholder="Вставьте ссылку на обложку"
                    className="border-vintage-brown/30 focus:border-vintage-dark-brown"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="album-price" className="text-vintage-warm">Цена (₽)</Label>
                <Input
                  id="album-price"
                  type="number"
                  value={newAlbum.price}
                  onChange={(e) => setNewAlbum({...newAlbum, price: Number(e.target.value)})}
                  placeholder="Цена альбома"
                  className="border-vintage-brown/30 focus:border-vintage-dark-brown"
                />
              </div>
              <div>
                <Label htmlFor="album-description" className="text-vintage-warm">Описание</Label>
                <Textarea
                  id="album-description"
                  value={newAlbum.description}
                  onChange={(e) => setNewAlbum({...newAlbum, description: e.target.value})}
                  placeholder="Описание альбома"
                  className="border-vintage-brown/30 focus:border-vintage-dark-brown"
                />
              </div>
              <Button 
                onClick={handleAddAlbum}
                className="w-full bg-vintage-dark-brown hover:bg-vintage-warm text-vintage-cream"
              >
                Создать альбом
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Диалог редактирования альбома */}
      <Dialog open={showEditAlbum} onOpenChange={setShowEditAlbum}>
        <DialogContent className="bg-vintage-cream border-vintage-brown/20">
          <DialogHeader>
            <DialogTitle className="text-vintage-warm">Редактировать альбом</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-album-title" className="text-vintage-warm">Название</Label>
              <Input
                id="edit-album-title"
                value={editAlbumData.title}
                onChange={(e) => setEditAlbumData({...editAlbumData, title: e.target.value})}
                placeholder="Название альбома"
                className="border-vintage-brown/30 focus:border-vintage-dark-brown"
              />
            </div>
            <div>
              <Label htmlFor="edit-album-artist" className="text-vintage-warm">Исполнитель</Label>
              <Input
                id="edit-album-artist"
                value={editAlbumData.artist}
                onChange={(e) => setEditAlbumData({...editAlbumData, artist: e.target.value})}
                placeholder="Имя исполнителя"
                className="border-vintage-brown/30 focus:border-vintage-dark-brown"
              />
            </div>
            <div>
              <Label htmlFor="edit-album-cover" className="text-vintage-warm">Обложка</Label>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditCoverUpload}
                  className="w-full px-3 py-2 border border-vintage-brown/30 rounded-md focus:border-vintage-dark-brown bg-vintage-cream file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-vintage-dark-brown file:text-vintage-cream hover:file:bg-vintage-warm"
                />
                {editCoverPreview && (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-vintage-brown/20">
                    <img src={editCoverPreview} alt="Предпросмотр" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="text-sm text-vintage-warm/60">или</div>
                <Input
                  id="edit-album-cover"
                  value={editAlbumData.cover}
                  onChange={(e) => setEditAlbumData({...editAlbumData, cover: e.target.value})}
                  placeholder="Вставьте ссылку на обложку"
                  className="border-vintage-brown/30 focus:border-vintage-dark-brown"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-album-price" className="text-vintage-warm">Цена (₽)</Label>
              <Input
                id="edit-album-price"
                type="number"
                value={editAlbumData.price}
                onChange={(e) => setEditAlbumData({...editAlbumData, price: Number(e.target.value)})}
                placeholder="Цена альбома"
                className="border-vintage-brown/30 focus:border-vintage-dark-brown"
              />
            </div>
            <div>
              <Label htmlFor="edit-album-description" className="text-vintage-warm">Описание</Label>
              <Textarea
                id="edit-album-description"
                value={editAlbumData.description}
                onChange={(e) => setEditAlbumData({...editAlbumData, description: e.target.value})}
                placeholder="Описание альбома"
                className="border-vintage-brown/30 focus:border-vintage-dark-brown"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleSaveEditAlbum}
                className="flex-1 bg-vintage-dark-brown hover:bg-vintage-warm text-vintage-cream"
              >
                Сохранить изменения
              </Button>
              <Button 
                onClick={() => setShowEditAlbum(false)}
                variant="outline"
                className="border-vintage-brown text-vintage-dark-brown hover:bg-vintage-brown hover:text-vintage-cream"
              >
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid md:grid-cols-2 gap-4">
        {albums.map((album) => (
          <Card key={album.id} className="bg-vintage-cream/95 border-vintage-brown/20">
            <CardContent className="p-4">
              <div className="flex gap-3 mb-3">
                {album.cover ? (
                  <div className="w-20 h-20 rounded overflow-hidden flex-shrink-0">
                    <img src={album.cover} alt={album.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-vintage-dark-brown/20 rounded flex items-center justify-center flex-shrink-0">
                    <Icon name="Disc" size={32} className="text-vintage-dark-brown" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h4 className="font-bold text-vintage-warm">{album.title}</h4>
                      <p className="text-sm text-vintage-warm/70">{album.artist}</p>
                    </div>
                    <Badge className="bg-vintage-dark-brown text-vintage-cream">
                      {album.tracks} треков
                    </Badge>
                  </div>
                  <p className="text-sm text-vintage-warm/60 line-clamp-2">{album.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mb-3">
                <p className="font-bold text-vintage-dark-brown">{album.price} ₽</p>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => toggleAlbumExpanded(album.id)}
                    variant="outline"
                    size="sm"
                    className="border-vintage-brown text-vintage-dark-brown hover:bg-vintage-brown hover:text-vintage-cream"
                  >
                    <Icon name={expandedAlbums.includes(album.id) ? "ChevronUp" : "ChevronDown"} size={14} className="mr-1" />
                    Треки
                  </Button>
                  <Button 
                    onClick={() => handleEditAlbum(album)}
                    variant="outline"
                    size="sm"
                    className="border-vintage-brown text-vintage-dark-brown hover:bg-vintage-brown hover:text-vintage-cream"
                  >
                    <Icon name="Edit" size={14} />
                  </Button>
                  <Button 
                    onClick={() => handleDeleteAlbum(album.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-500 border-red-300 hover:bg-red-50"
                  >
                    <Icon name="Trash2" size={14} />
                  </Button>
                </div>
              </div>
              
              {/* Список треков альбома */}
              {expandedAlbums.includes(album.id) && album.trackList && album.trackList.length > 0 && (
                <div className="mt-3 pt-3 border-t border-vintage-brown/20">
                  <h5 className="text-sm font-semibold text-vintage-warm mb-2">Треки альбома:</h5>
                  <div className="space-y-2">
                    {album.trackList.map((track) => (
                      <div 
                        key={track.id} 
                        className="flex items-center justify-between p-2 bg-vintage-brown/10 rounded-lg"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Icon name="Music" size={14} className="text-vintage-dark-brown flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-vintage-warm truncate">{track.title}</p>
                            <div className="flex gap-2 text-xs text-vintage-warm/60">
                              <span>{track.duration}</span>
                              <span>•</span>
                              <span>{track.price} ₽</span>
                            </div>
                          </div>
                        </div>
                        <Button 
                          onClick={() => handleDeleteTrack(track.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:bg-red-50 h-7 w-7 p-0 flex-shrink-0"
                        >
                          <Icon name="Trash2" size={12} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {expandedAlbums.includes(album.id) && (!album.trackList || album.trackList.length === 0) && (
                <div className="mt-3 pt-3 border-t border-vintage-brown/20">
                  <p className="text-sm text-vintage-warm/60 text-center">Треков пока нет</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AlbumManager;