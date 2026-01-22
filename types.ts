export interface Photo {
  url: string;
  caption: string;
}

export interface Theme {
  id: string;
  title: string;
  description: string; // Used for AI context
  photos: Photo[];
}

export interface Museum {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  address: string;
  hours: string;
  price: string;
  themes: Theme[];
  icon: string;
}

export enum ViewState {
  MAP = 'MAP',
  LIST = 'LIST',
}