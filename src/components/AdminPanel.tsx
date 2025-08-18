import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Icon from '@/components/ui/icon';

interface Track {
  id: string;
  title: string;
  duration: string;
  file: string;
  price: number;
}

interface Album {
  id: string;
  title: string;
  artist: string;
  cover: string;
  price: number;
  tracks: number;
  description: string;
  trackList: Track[];
}

interface AdminPanelProps {
  albums: Album[];
  tracks: Track[];
  onAddAlbum: (album: Omit<Album, 'id'>) => void;
  onEditAlbum: (albumId: string, albumData: Omit<Album, 'id'>) => void;
  onRemoveAlbum: (albumId: string) => void;
  onAddTrack: (albumId: string, track: Omit<Track, 'id'>) => void;
  onRemoveTrack: (trackId: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  albums,
  tracks,
  onAddAlbum,
  onEditAlbum,
  onRemoveAlbum,
  onAddTrack,
  onRemoveTrack
}) => {
  const [newAlbum, setNewAlbum] = useState({
    title: '',
    artist: '',
    cover: '',
    price: 0,
    description: ''
  });

  const [newTrack, setNewTrack] = useState({
    title: '',
    duration: '',
    file: '',
    price: 129
  });

  const [selectedAlbum, setSelectedAlbum] = useState('');
  const [showAddAlbum, setShowAddAlbum] = useState(false);
  const [showAddTrack, setShowAddTrack] = useState(false);
  const [showEditAlbum, setShowEditAlbum] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [editAlbumData, setEditAlbumData] = useState({
    title: '',
    artist: '',
    cover: '',
    price: 0,
    description: ''
  });

  const handleAddAlbum = () => {
    if (newAlbum.title && newAlbum.artist) {
      onAddAlbum({
        ...newAlbum,
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
      setShowAddAlbum(false);
    }
  };

  const handleAddTrack = () => {
    if (newTrack.title && newTrack.duration && selectedAlbum) {
      onAddTrack(selectedAlbum, newTrack);
      setNewTrack({
        title: '',
        duration: '',
        file: '',
        price: 129
      });
      setShowAddTrack(false);
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
    setShowEditAlbum(true);
  };

  const handleSaveEditAlbum = () => {
    if (editingAlbum && editAlbumData.title && editAlbumData.artist) {
      onEditAlbum(editingAlbum.id, {
        ...editAlbumData,
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
    }
  };

  const handleDeleteAlbum = (albumId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот альбом?')) {
      onRemoveAlbum(albumId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Управление альбомами */}
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
                  <Label htmlFor="album-cover" className="text-vintage-warm">Обложка (URL)</Label>
                  <Input
                    id="album-cover"
                    value={newAlbum.cover}
                    onChange={(e) => setNewAlbum({...newAlbum, cover: e.target.value})}
                    placeholder="Ссылка на обложку"
                    className="border-vintage-brown/30 focus:border-vintage-dark-brown"
                  />
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
                <Label htmlFor="edit-album-cover" className="text-vintage-warm">Обложка (URL)</Label>
                <Input
                  id="edit-album-cover"
                  value={editAlbumData.cover}
                  onChange={(e) => setEditAlbumData({...editAlbumData, cover: e.target.value})}
                  placeholder="Ссылка на обложку"
                  className="border-vintage-brown/30 focus:border-vintage-dark-brown"
                />
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
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-vintage-warm">{album.title}</h4>
                    <p className="text-sm text-vintage-warm/70">{album.artist}</p>
                  </div>
                  <Badge className="bg-vintage-dark-brown text-vintage-cream">
                    {album.tracks} треков
                  </Badge>
                </div>
                <p className="text-sm text-vintage-warm/60 mb-2">{album.description}</p>
                <div className="flex items-center justify-between">
                  <p className="font-bold text-vintage-dark-brown">{album.price} ₽</p>
                  <div className="flex gap-2">
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
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Управление треками */}
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
                  <Label htmlFor="track-file" className="text-vintage-warm">Файл (URL)</Label>
                  <Input
                    id="track-file"
                    value={newTrack.file}
                    onChange={(e) => setNewTrack({...newTrack, file: e.target.value})}
                    placeholder="Ссылка на аудиофайл"
                    className="border-vintage-brown/30 focus:border-vintage-dark-brown"
                  />
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
                <Button 
                  onClick={handleAddTrack}
                  className="w-full bg-vintage-dark-brown hover:bg-vintage-warm text-vintage-cream"
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
                <Icon name="Music" size={16} className="text-vintage-dark-brown" />
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
    </div>
  );
};

export default AdminPanel;