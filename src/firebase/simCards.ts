import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { getFirestoreDb } from './config';
import type { SimCard, SimCardInput, BulkResult } from '../types';

const COLLECTION_NAME = 'sim_cards';

/** Normalize a phone number by stripping all non-digit characters */
function normalizeNumber(num: string): string {
  return num.replace(/\D/g, '');
}

/**
 * Checks if a single number already exists in Firestore.
 * Uses a where() query for efficiency (single read).
 * Returns the existing SimCard if found, or null.
 */
export async function checkDuplicateNumber(number: string): Promise<SimCard | null> {
  const db = getFirestoreDb();
  const colRef = collection(db, COLLECTION_NAME);
  const q = query(colRef, where('number', '==', number));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  const docSnap = snapshot.docs[0];
  const data = docSnap.data();
  return {
    id: docSnap.id,
    number: data.number,
    carrier: data.carrier,
    category: data.category,
    price: data.price,
    description: data.description,
  } as SimCard;
}

/**
 * Fetches all existing numbers from Firestore and returns a Map
 * of normalized number -> { id, number } for duplicate checking in bulk operations.
 */
export async function fetchExistingNumbers(): Promise<Map<string, { id: string; number: string }>> {
  const db = getFirestoreDb();
  const colRef = collection(db, COLLECTION_NAME);
  const snapshot = await getDocs(colRef);

  const map = new Map<string, { id: string; number: string }>();
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const normalized = normalizeNumber(data.number);
    map.set(normalized, { id: docSnap.id, number: data.number });
  }
  return map;
}

/**
 * Fetches all SIM card documents from Firestore and maps them to the application SimCard type.
 */
export async function fetchAllSimCards(): Promise<SimCard[]> {
  const db = getFirestoreDb();
  const colRef = collection(db, COLLECTION_NAME);
  const snapshot = await getDocs(colRef);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      number: data.number,
      carrier: data.carrier,
      category: data.category,
      price: data.price,
      description: data.description,
      createdAt: data.createdAt?.toDate?.() ?? data.createdAt ?? null,
    } as SimCard;
  });
}

/**
 * Creates a new SIM card document in Firestore.
 * Auto-generates a `createdAt` timestamp via serverTimestamp().
 * @returns The generated document ID.
 */
export async function createSimCard(data: SimCardInput): Promise<string> {
  const db = getFirestoreDb();
  const colRef = collection(db, COLLECTION_NAME);

  const docRef = await addDoc(colRef, {
    number: data.number,
    carrier: data.carrier,
    category: data.category,
    price: data.price,
    description: data.description ?? null,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

/**
 * Updates an existing SIM card document in Firestore.
 */
export async function updateSimCard(
  id: string,
  data: Partial<SimCardInput>
): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTION_NAME, id);
  // Remove undefined values and convert to null for Firestore compatibility
  const cleanData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    cleanData[key] = value === undefined ? null : value;
  }
  await updateDoc(docRef, cleanData);
}

/**
 * Deletes a SIM card document from Firestore.
 */
export async function deleteSimCard(id: string): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}

/**
 * Creates multiple SIM card documents in Firestore using batched writes.
 * Firestore limits batches to 500 operations, so this function splits
 * large arrays into multiple batches.
 * @returns A BulkResult with success/failure counts.
 */
export async function bulkCreateSimCards(
  cards: SimCardInput[]
): Promise<BulkResult> {
  const db = getFirestoreDb();
  const colRef = collection(db, COLLECTION_NAME);
  const BATCH_LIMIT = 500;

  let successCount = 0;
  let failedCount = 0;
  const failures: BulkResult['failures'] = [];

  // Process cards in batches of 500 (Firestore batch limit)
  for (let i = 0; i < cards.length; i += BATCH_LIMIT) {
    const chunk = cards.slice(i, i + BATCH_LIMIT);
    const batch = writeBatch(db);

    for (let j = 0; j < chunk.length; j++) {
      const card = chunk[j];
      const newDocRef = doc(colRef);
      batch.set(newDocRef, {
        number: card.number,
        carrier: card.carrier,
        category: card.category,
        price: card.price,
        description: card.description ?? null,
        createdAt: serverTimestamp(),
      });
    }

    try {
      await batch.commit();
      successCount += chunk.length;
    } catch {
      // If a batch fails, all items in that batch are counted as failures
      for (let j = 0; j < chunk.length; j++) {
        const globalIndex = i + j;
        failures.push({
          index: globalIndex,
          errors: { batch: 'Batch write failed' },
        });
      }
      failedCount += chunk.length;
    }
  }

  return {
    successCount,
    failedCount,
    failures,
  };
}
