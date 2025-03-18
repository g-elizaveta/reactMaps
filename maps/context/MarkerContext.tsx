import React, { createContext, useState, useContext } from 'react';

interface MarkerData {
  id: number;
  latitude: number;
  longitude: number;
  images: string[];
}

interface MarkerContextType {
  markers: MarkerData[];
  addMarker: (marker: MarkerData) => void;
  updateMarker: (id: number, images: string[]) => void;
}

const MarkerContext = createContext<MarkerContextType | null>(null);

export const MarkerProvider = ({ children }: { children: React.ReactNode }) => {
  const [markers, setMarkers] = useState<MarkerData[]>([]);

  const addMarker = (marker: MarkerData) => {
    setMarkers((prev) => [...prev, marker]);
  };

  const updateMarker = (id: number, images: string[]) => {
    setMarkers((prev) =>
      prev.map((marker) => (marker.id === id ? { ...marker, images } : marker))
    );
  };

  return (
    <MarkerContext.Provider value={{ markers, addMarker, updateMarker }}>
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