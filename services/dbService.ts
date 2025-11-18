import { AttendanceRecord, Client, ThemeOption } from '../types';
import { THEMES } from '../constants'; // Import default data for seeding

const DB_NAME = 'SalaEmpreendedorDB';
const DB_VERSION = 3; // Incremented for 'temas' store
const STORE_ATTENDANCE = 'atendimentos';
const STORE_CLIENTS = 'clientes';
const STORE_THEMES = 'temas';

export const dbService = {
  init: (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = (event.target as IDBOpenDBRequest).transaction;
        
        // Store de Atendimentos
        if (!db.objectStoreNames.contains(STORE_ATTENDANCE)) {
          const store = db.createObjectStore(STORE_ATTENDANCE, { keyPath: 'id' });
          store.createIndex('date', 'startDate', { unique: false });
          store.createIndex('document', 'document', { unique: false });
        }

        // Store de Clientes
        if (!db.objectStoreNames.contains(STORE_CLIENTS)) {
          const clientStore = db.createObjectStore(STORE_CLIENTS, { keyPath: 'document' });
          clientStore.createIndex('name', 'name', { unique: false });
        }

        // Store de Temas (Nova)
        if (!db.objectStoreNames.contains(STORE_THEMES)) {
          db.createObjectStore(STORE_THEMES, { keyPath: 'id' });
        }
      };

      request.onsuccess = async (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        // Check if we need to seed themes
        await dbService.seedThemesIfEmpty(db);
        resolve();
      };
      
      request.onerror = (event) => reject((event.target as IDBOpenDBRequest).error);
    });
  },

  seedThemesIfEmpty: (db: IDBDatabase): Promise<void> => {
    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_THEMES], 'readwrite');
      const store = transaction.objectStore(STORE_THEMES);
      const countRequest = store.count();

      countRequest.onsuccess = () => {
        if (countRequest.result === 0) {
          console.log("Seeding initial themes...");
          THEMES.forEach(theme => store.put(theme));
        }
        resolve();
      };
    });
  },

  // --- Atendimentos ---

  addAttendance: (record: AttendanceRecord): Promise<void> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction([STORE_ATTENDANCE], 'readwrite');
        const store = transaction.objectStore(STORE_ATTENDANCE);
        
        const addRequest = store.put(record);

        addRequest.onsuccess = () => resolve();
        addRequest.onerror = () => reject(addRequest.error);
      };
      
      request.onerror = (event) => reject((event.target as IDBOpenDBRequest).error);
    });
  },

  getAllAttendances: (): Promise<AttendanceRecord[]> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction([STORE_ATTENDANCE], 'readonly');
        const store = transaction.objectStore(STORE_ATTENDANCE);
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
          const results = getAllRequest.result as AttendanceRecord[];
          results.sort((a, b) => {
             const dateA = new Date(a.startDate.split('/').reverse().join('-'));
             const dateB = new Date(b.startDate.split('/').reverse().join('-'));
             return dateB.getTime() - dateA.getTime();
          });
          resolve(results);
        };
        getAllRequest.onerror = () => reject(getAllRequest.error);
      };

      request.onerror = (event) => reject((event.target as IDBOpenDBRequest).error);
    });
  },

  // --- Clientes ---

  saveClient: (client: Client): Promise<void> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction([STORE_CLIENTS], 'readwrite');
        const store = transaction.objectStore(STORE_CLIENTS);
        const req = store.put(client); 
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      };
      request.onerror = (e) => reject((e.target as IDBOpenDBRequest).error);
    });
  },

  getClient: (document: string): Promise<Client | undefined> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction([STORE_CLIENTS], 'readonly');
        const store = transaction.objectStore(STORE_CLIENTS);
        const req = store.get(document);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      };
      request.onerror = (e) => reject((e.target as IDBOpenDBRequest).error);
    });
  },

  getAllClients: (): Promise<Client[]> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction([STORE_CLIENTS], 'readonly');
        const store = transaction.objectStore(STORE_CLIENTS);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      };
      request.onerror = (e) => reject((e.target as IDBOpenDBRequest).error);
    });
  },

  deleteClient: (document: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const transaction = db.transaction([STORE_CLIENTS], 'readwrite');
          const store = transaction.objectStore(STORE_CLIENTS);
          const req = store.delete(document);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        };
        request.onerror = (e) => reject((e.target as IDBOpenDBRequest).error);
      });
  },

  // --- Temas ---

  getAllThemes: (): Promise<ThemeOption[]> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction([STORE_THEMES], 'readonly');
        const store = transaction.objectStore(STORE_THEMES);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      };
      request.onerror = (e) => reject((e.target as IDBOpenDBRequest).error);
    });
  },

  saveTheme: (theme: ThemeOption): Promise<void> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction([STORE_THEMES], 'readwrite');
        const store = transaction.objectStore(STORE_THEMES);
        const req = store.put(theme);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      };
      request.onerror = (e) => reject((e.target as IDBOpenDBRequest).error);
    });
  },

  deleteTheme: (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const transaction = db.transaction([STORE_THEMES], 'readwrite');
          const store = transaction.objectStore(STORE_THEMES);
          const req = store.delete(id);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        };
        request.onerror = (e) => reject((e.target as IDBOpenDBRequest).error);
      });
  }
};