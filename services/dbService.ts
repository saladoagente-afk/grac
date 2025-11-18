import { AttendanceRecord } from '../types';

const DB_NAME = 'SalaEmpreendedorDB';
const DB_VERSION = 1;
const STORE_NAME = 'atendimentos';

export const dbService = {
  init: (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('date', 'startDate', { unique: false });
          store.createIndex('document', 'document', { unique: false });
        }
      };

      request.onsuccess = () => resolve();
      request.onerror = (event) => reject((event.target as IDBOpenDBRequest).error);
    });
  },

  addAttendance: (record: AttendanceRecord): Promise<void> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        // Garante que o ID é único ou usa o existente
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
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
          // Ordenar por data (mais recente primeiro) manualmente, pois getAll retorna por chave primária
          const results = getAllRequest.result as AttendanceRecord[];
          results.sort((a, b) => {
             // Converter dd/mm/yyyy para objeto Date para comparação
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
  }
};
