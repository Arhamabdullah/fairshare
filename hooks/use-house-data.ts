'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  addExpense,
  addRoommate,
  getHouseData,
  removeRoommate,
  saveCleaningGroups,
  saveCookingAssignments,
  saveSettlement,
} from '@/lib/firebase/firestore';
import { isFirebaseConfigured } from '@/lib/firebase/config';
import {
  CleaningGroup,
  CookingAssignment,
  HouseData,
  Roommate,
  SettlementTrackingItem,
} from '@/lib/types';
import { buildSettlementTracking } from '@/lib/utils';

const emptyData: HouseData = {
  roommates: [],
  expenses: [],
  cookingAssignments: [],
  cleaningGroups: [],
  settlements: [],
};

export function useHouseData() {
  const [data, setData] = useState<HouseData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [backendReady, setBackendReady] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getHouseData();
      setData({
        roommates: result.roommates,
        expenses: result.expenses,
        cookingAssignments: result.cookingAssignments,
        cleaningGroups: result.cleaningGroups,
        settlements:
          result.settlements.length > 0
            ? result.settlements
            : buildSettlementTracking(result.roommates, result.expenses),
      });
      setBackendReady(isFirebaseConfigured());
      console.log('House data refreshed:', result);
    } catch (error) {
      console.error('useHouseData refresh failed:', error);
      setData(emptyData);
      setBackendReady(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createExpense = useCallback(
    async (input: { date: string; amount: number; paidById: string; note: string; file?: File | null }) => {
      const created = await addExpense(input);
      setData((current) => {
        const nextExpenses = [created, ...current.expenses].sort((a, b) => b.date.localeCompare(a.date));
        return {
          ...current,
          expenses: nextExpenses,
          settlements: buildSettlementTracking(current.roommates, nextExpenses),
        };
      });
      return created;
    },
    [],
  );

  const createRoommate = useCallback(async (input: Pick<Roommate, 'name' | 'email'>) => {
    const created = await addRoommate(input);
    setData((current) => {
      const nextRoommates = [...current.roommates, created].sort((a, b) => a.name.localeCompare(b.name));
      return {
        ...current,
        roommates: nextRoommates,
        settlements: buildSettlementTracking(nextRoommates, current.expenses),
      };
    });
    return created;
  }, []);

  const deleteRoommate = useCallback(async (roommateId: string) => {
    await removeRoommate(roommateId);
    setData((current) => {
      const nextRoommates = current.roommates.filter((item) => item.id !== roommateId);
      return {
        ...current,
        roommates: nextRoommates,
        cookingAssignments: current.cookingAssignments.filter(
          (assignment) => assignment.roommateId !== roommateId,
        ),
        cleaningGroups: current.cleaningGroups.map((group) => ({
          ...group,
          memberIds: group.memberIds.filter((id) => id !== roommateId),
        })),
        settlements: buildSettlementTracking(nextRoommates, current.expenses),
      };
    });
  }, []);

  const updateSettlement = useCallback(async (row: SettlementTrackingItem) => {
    await saveSettlement(row);
    setData((current) => ({
      ...current,
      settlements: current.settlements.some((item) => item.roommateId === row.roommateId)
        ? current.settlements.map((item) => (item.roommateId === row.roommateId ? row : item))
        : [...current.settlements, row].sort((a, b) => a.name.localeCompare(b.name)),
    }));
  }, []);

  const updateGroups = useCallback(async (groups: CleaningGroup[]) => {
    await saveCleaningGroups(groups);
    setData((current) => ({ ...current, cleaningGroups: groups }));
  }, []);

  const updateAssignments = useCallback(async (assignments: CookingAssignment[]) => {
    await saveCookingAssignments(assignments);
    setData((current) => ({ ...current, cookingAssignments: assignments }));
  }, []);

  const dataSummary = useMemo(
    () => ({
      totalMembers: data.roommates.filter((roommate) => roommate.isActive !== false).length,
      totalExpenses: data.expenses.reduce((sum, expense) => sum + expense.amount, 0),
    }),
    [data],
  );

  return {
    ...data,
    loading,
    backendReady,
    dataSummary,
    refresh,
    createExpense,
    createRoommate,
    deleteRoommate,
    updateSettlement,
    updateGroups,
    updateAssignments,
  };
}
