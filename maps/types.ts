export interface MarkerData {
    id: number;
    latitude: number;
    longitude: number;
    images: string[];
  }
  
  export interface ImageData {
    id: string;
    uri: string;
  }
  
  export type RootStackParamList = {
    Map: undefined;
    MarkerDetails: { id: number };
  };