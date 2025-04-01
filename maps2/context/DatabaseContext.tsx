import React, { createContext, useContext, useState, useEffect } from 'react';
import { openDatabase, initDatabase, executeSql, queryAll } from '../database/db';
import * as SQLite from 'expo-sqlite';

interface DatabaseContextType {
  db: SQLite.SQLiteDatabase | null;
  addMarker: (latitude: number, longitude: number) => Promise<number>;
  deleteMarker: (id: number) => Promise<void>;
  getMarkers: () => Promise<any[]>;
  addImage: (markerId: number, uri: string) => Promise<void>;
  deleteImage: (id: number) => Promise<void>;
  getMarkerImages: (markerId: number) => Promise<any[]>;
  isDbReady: boolean;
  error: Error | null;
}

const DatabaseContext = createContext<DatabaseContextType | null>(null);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [isDbReady, setIsDbReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeDB = async () => {
      try {
        // Открытие соединения
        const database = openDatabase();
        await initDatabase(database);
        setDb(database);
        setIsDbReady(true);
      } catch (err) {
        console.error('Database initialization error:', err);
        setError(err as Error);
      }
    };

    initializeDB();

    return () => {
      db?.closeAsync().catch(e => console.error('Error closing DB:', e));
    };
  }, []);

  const addMarker = async (latitude: number, longitude: number): Promise<number> => {
    if (!isDbReady || !db)  throw new Error('Database not initialized');
    const result = await executeSql(
      db,
      'INSERT INTO markers (latitude, longitude) VALUES (?, ?)',
      [latitude, longitude]
    );
    return result.insertId!;
  };

  const deleteMarker = async (id: number): Promise<void> => {
    if (!isDbReady || !db)  throw new Error('Database not initialized');
    await executeSql(db, 'DELETE FROM markers WHERE id = ?', [id]);
  };

  const getMarkers = async (): Promise<any[]> => {
    if (!isDbReady || !db) throw new Error('Database not ready');
    return await db.getAllAsync('SELECT * FROM markers');
  };

  const addImage = async (markerId: number, uri: string): Promise<void> => {
    if (!isDbReady || !db)  throw new Error('Database not initialized');
    await executeSql(
      db,
      'INSERT INTO marker_images (marker_id, uri) VALUES (?, ?)',
      [markerId, uri]
    );
  };

  const deleteImage = async (id: number): Promise<void> => {
    if (!isDbReady || !db)  throw new Error('Database not initialized');
    await db.runAsync('DELETE FROM marker_images WHERE id = ?', [id]);
  };

  const getMarkerImages = async (markerId: number): Promise<any[]> => {
    if (!isDbReady || !db)  throw new Error('Database not initialized');
    return await queryAll(db, 'SELECT * FROM marker_images WHERE marker_id = ?', [markerId]);
  };

  const value = {
    db,
    isDbReady,
    addMarker,
    deleteMarker,
    getMarkers,
    addImage,
    deleteImage,
    getMarkerImages,
    error,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};