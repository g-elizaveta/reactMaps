import * as SQLite from 'expo-sqlite';

// Интерфейс для типизации результатов запроса
interface SQLResult {
  insertId?: number;
  rows: any[];
}

export const openDatabase = (): SQLite.SQLiteDatabase => {
  return SQLite.openDatabaseSync('markers.db');
};

export const initDatabase = async (db: SQLite.SQLiteDatabase): Promise<void> => {
  try {
    await db.execAsync(`
      PRAGMA foreign_keys = ON;
      CREATE TABLE IF NOT EXISTS markers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS marker_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        marker_id INTEGER NOT NULL,
        uri TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (marker_id) REFERENCES markers (id) ON DELETE CASCADE
      );
    `);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

// Функция для выполнения INSERT/UPDATE/DELETE
export const executeSql = async (
  db: SQLite.SQLiteDatabase,
  sql: string,
  params: any[] = []
): Promise<SQLResult> => {
  try {
    const result = await db.runAsync(sql, params);
    return {
      insertId: result.lastInsertRowId,
      rows: [] // runAsync не возвращает rows
    };
  } catch (error) {
    console.error('SQL Error:', error);
    throw error;
  }
};

// Функция для выполнения SELECT запросов
export const queryAll = async (
  db: SQLite.SQLiteDatabase,
  sql: string,
  params: any[] = []
): Promise<any[]> => {
  try {
    // Используем getAllAsync для получения данных
    return await db.getAllAsync(sql, params);
  } catch (error) {
    console.error('Query Error:', error);
    throw error;
  }
};