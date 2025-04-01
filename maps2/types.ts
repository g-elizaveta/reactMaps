export interface MarkerData {
  id: number;
  latitude: number;
  longitude: number;
  images?: string[];
  created_at?: string;
}
  
export interface ImageData {
  id: string;
  uri: string;
}

export type RootStackParamList = {
  Map: undefined;
  MarkerDetails: { id: number };
};

export interface MarkerData {
  id: number;
  latitude: number;
  longitude: number;
  created_at?: string;
}

export interface MarkerImage {
  id: number;
  marker_id: number;
  uri: string;
  created_at?: string;
}

export interface DatabaseContextType {
  db: any;
  addMarker: (latitude: number, longitude: number) => Promise<number>;
  deleteMarker: (id: number) => Promise<void>;
  getMarkers: () => Promise<MarkerData[]>;
  addImage: (markerId: number, uri: string) => Promise<void>;
  deleteImage: (id: number) => Promise<void>;
  getMarkerImages: (markerId: number) => Promise<MarkerImage[]>;
  error: Error | null;
}