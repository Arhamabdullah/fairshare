import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from './client';
import { CleaningGroup, CookingAssignment, Expense, Roommate, SettlementTrackingItem } from '@/lib/types';
import { buildSettlementTracking, slugifyName } from '@/lib/utils';

async function loadCollection<T>(name: string, sortField?: string): Promise<T[]> {
  if (!db) return [];
  try {
    const collectionRef = collection(db, name);
    const snapshot = sortField
      ? await getDocs(query(collectionRef, orderBy(sortField, 'asc')))
      : await getDocs(collectionRef);
    if (snapshot.empty) return [];
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as T);
  } catch (error) {
    console.error(`Error loading collection: ${name}`, error);
    return [];
  }
}

export async function getActiveRoommates(): Promise<Roommate[]> {
  if (!db) return [];
  try {
    const snapshot = await getDocs(collection(db, 'roommates'));
    if (snapshot.empty) return [];
    return snapshot.docs
      .map((item) => ({ id: item.id, ...item.data() }) as Roommate)
      .filter((roommate) => roommate.isActive !== false)
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error loading roommates', error);
    return [];
  }
}

export async function getHouseData() {
  const [roommatesResult, expensesResult, cookingResult, cleaningResult, settlementsResult] =
    await Promise.allSettled([
      getActiveRoommates(),
      loadCollection<Expense>('expenses', 'date'),
      loadCollection<CookingAssignment>('cookingAssignments', 'date'),
      loadCollection<CleaningGroup>('cleaningGroups'),
      loadCollection<SettlementTrackingItem>('settlements'),
    ]);

  const roommatesData = roommatesResult.status === 'fulfilled' ? roommatesResult.value : [];
  const expensesData = expensesResult.status === 'fulfilled' ? expensesResult.value : [];
  const cookingData = cookingResult.status === 'fulfilled' ? cookingResult.value : [];
  const cleaningData = cleaningResult.status === 'fulfilled' ? cleaningResult.value : [];
  const settlementsData = settlementsResult.status === 'fulfilled' ? settlementsResult.value : [];

  const computedSettlements = buildSettlementTracking(roommatesData, expensesData);
  const settlementMap = new Map(settlementsData.map((row) => [row.roommateId, row]));

  const mergedSettlements = computedSettlements.map((computedRow) => {
    const savedRow = settlementMap.get(computedRow.roommateId);
    if (!savedRow) return computedRow;
    return {
      ...computedRow,
      settledAmount: savedRow.settledAmount ?? computedRow.settledAmount,
      remaining: savedRow.remaining ?? computedRow.remaining,
      status: savedRow.status ?? computedRow.status,
      updatedAt: savedRow.updatedAt ?? computedRow.updatedAt,
      notified: savedRow.notified ?? computedRow.notified,
    };
  });

  return {
    roommates: roommatesData,
    expenses: expensesData,
    cookingAssignments: cookingData,
    cleaningGroups: cleaningData,
    settlements: mergedSettlements,
  };
}

export async function addRoommate(input: Pick<Roommate, 'name' | 'email'>) {
  if (!db) {
    return {
      id: `rm-${slugifyName(input.name)}`,
      ...input,
      isActive: true,
      createdAt: new Date().toISOString(),
    } as Roommate;
  }

  const collectionRef = collection(db, 'roommates');
  const newDoc = await addDoc(collectionRef, {
    ...input,
    isActive: true,
    createdAt: serverTimestamp(),
  });
  return { id: newDoc.id, ...input, isActive: true } as Roommate;
}

export async function removeRoommate(roommateId: string) {
  if (!db) return;
  await updateDoc(doc(db, 'roommates', roommateId), {
    isActive: false,
    updatedAt: serverTimestamp(),
  });
}

export async function saveSettlement(row: SettlementTrackingItem) {
  if (!db) return row;
  await setDoc(
    doc(db, 'settlements', row.roommateId),
    { ...row, updatedAt: serverTimestamp() },
    { merge: true },
  );
  return row;
}

export async function saveCleaningGroups(groups: CleaningGroup[]) {
  if (!db) return groups;
  const existingSnapshot = await getDocs(collection(db, 'cleaningGroups'));
  await Promise.all(
    existingSnapshot.docs.map((item) => deleteDoc(doc(db, 'cleaningGroups', item.id))),
  );
  await Promise.all(
    groups.map((group) =>
      setDoc(
        doc(db, 'cleaningGroups', group.id ?? group.name.toLowerCase().replace(/\s+/g, '-')),
        group,
        { merge: false },
      ),
    ),
  );
  return groups;
}

export async function saveCookingAssignments(assignments: CookingAssignment[]) {
  if (!db) return assignments;
  const existingSnapshot = await getDocs(collection(db, 'cookingAssignments'));
  await Promise.all(
    existingSnapshot.docs.map((item) => deleteDoc(doc(db, 'cookingAssignments', item.id))),
  );
  await Promise.all(
    assignments.map((assignment) =>
      setDoc(doc(db, 'cookingAssignments', assignment.id), assignment, { merge: false }),
    ),
  );
  return assignments;
}

export async function addExpense(input: {
  date: string;
  amount: number;
  paidById: string;
  note: string;
  file?: File | null;
}) {
  const receiptName = input.file?.name ?? '';

  if (!db) {
    return {
      id: `expense-${Date.now()}`,
      date: input.date,
      amount: input.amount,
      paidById: input.paidById,
      note: input.note,
      receiptName,
      receiptUrl: '',
      createdAt: new Date().toISOString(),
    } as Expense;
  }

  const payload = {
    date: input.date,
    amount: input.amount,
    paidById: input.paidById,
    note: input.note,
    receiptName,
    receiptUrl: '',
    createdAt: serverTimestamp(),
  };
  const newDoc = await addDoc(collection(db, 'expenses'), payload);
  return { id: newDoc.id, ...payload } as unknown as Expense;
}

export async function seedFirestore() {
  return false;
}

export async function markRosterNotificationSent(
  id: string,
  collectionName: 'cookingAssignments' | 'settlements',
) {
  if (!db) return;
  await updateDoc(doc(db, collectionName, id), {
    notified: true,
    updatedAt: serverTimestamp(),
  });
}
