  import React, { createContext, useContext, useState, useEffect } from 'react';
  import { useDatabase } from './DatabaseContext';
  import { MarkerData, MarkerImage } from '../types';

  interface MarkerContextType {
    markers: MarkerData[];
    addMarker: (latitude: number, longitude: number) => Promise<void>;
    deleteMarker: (id: number) => Promise<void>;
    addImageToMarker: (markerId: number, uri: string) => Promise<void>;
    getMarkerImages: (markerId: number) => Promise<MarkerImage[]>;
    deleteImage: (imageId: number) => Promise<void>;
  }

  const MarkerContext = createContext<MarkerContextType | null>(null);

  export const MarkerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [markers, setMarkers] = useState<MarkerData[]>([]);
    const { 
      addMarker: dbAddMarker, 
      deleteMarker: dbDeleteMarker, 
      getMarkers: dbGetMarkers, 
      addImage: dbAddImage,
      getMarkerImages: dbGetMarkerImages,
      deleteImage: dbDeleteImage,
      isDbReady
    } = useDatabase();

    // Загрузка маркеров при монтировании
    useEffect(() => {
      if (!isDbReady) return;

      const loadMarkers = async () => {
        try {
          const loadedMarkers = await dbGetMarkers();
          setMarkers(loadedMarkers);
        } catch (error) {
          console.error('Error loading markers:', error);
        }
      };
      loadMarkers();
    },  [isDbReady]);

    const handleAddMarker = async (latitude: number, longitude: number) => {
      try {
        const id = await dbAddMarker(latitude, longitude);
        setMarkers(prev => [...prev, { 
          id, 
          latitude, 
          longitude 
        }]);
      } catch (error) {
        console.error('Error adding marker:', error);
        throw error;
      }
    };

    const handleDeleteMarker = async (id: number) => {
      try {
        await dbDeleteMarker(id);
        setMarkers(prev => prev.filter(marker => marker.id !== id));
      } catch (error) {
        console.error('Error deleting marker:', error);
        throw error;
      }
    };

    const handleAddImage = async (markerId: number, uri: string) => {
      try {
        await dbAddImage(markerId, uri);
        // Обновляем локальное состояние
        setMarkers(prev =>
          prev.map(marker =>
            marker.id === markerId
              ? { ...marker }
              : marker
          )
        );
      } catch (error) {
        console.error('Error adding image:', error);
        throw error;
      }
    };

    const handleGetMarkerImages = async (markerId: number) => {
      try {
        return await dbGetMarkerImages(markerId);
      } catch (error) {
        console.error('Error getting marker images:', error);
        throw error;
      }
    };

    const handleDeleteImage = async (imageId: number) => {
      try {
        await dbDeleteImage(imageId); 
      } catch (error) {
        console.error('Error deleting image:', error);
        throw error;
      }
    };

    return (
      <MarkerContext.Provider
        value={{
          markers,
          addMarker: handleAddMarker,
          deleteMarker: handleDeleteMarker,
          addImageToMarker: handleAddImage,
          getMarkerImages: handleGetMarkerImages,
          deleteImage: handleDeleteImage
        }}
      >
        {children}
      </MarkerContext.Provider>
    );
  };

  export const useMarkers = () => {
    const context = useContext(MarkerContext);
    if (!context) {
      throw new Error('useMarkers must be used within a MarkerProvider');
    }
    return context;
  };