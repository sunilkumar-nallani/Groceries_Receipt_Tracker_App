import Dexie, { type EntityTable } from 'dexie';
import { Receipt } from './types';

const db = new Dexie('GroceryTrackerDB') as Dexie & {
    receipts: EntityTable<
        Receipt,
        'id' // primary key
    >;
};

// Schema definition
db.version(1).stores({
    receipts: 'id, storeName, date, createdAt' // Indexes for fast querying
});

export { db };
