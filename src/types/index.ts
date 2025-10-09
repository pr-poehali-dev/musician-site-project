export interface CartItem {
  id: string;
  title: string;
  type: 'track' | 'album';
  price: number;
  quantity: number;
}

export interface Track {
  id: string;
  title: string;
  duration: string;
  file: string;
  price: number;
  cover?: string;
  albumId?: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  cover: string;
  price: number;
  tracks: number;
  description: string;
  trackList: Track[];
}