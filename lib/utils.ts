import { Expense, Roommate, SettlementTrackingItem } from './types';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 2,
  }).format(value);
}

export function getRoommateName(roommateId: string, roommates: Roommate[] = []): string {
  return roommates.find((roommate) => roommate.id === roommateId)?.name ?? 'Unknown';
}

export function slugifyName(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function buildSettlementSummary(roommates: Roommate[] = [], expenses: Expense[] = []) {
  const activeRoommates = roommates.filter((roommate) => roommate.isActive !== false);
  const total = expenses.reduce((sum, item) => sum + item.amount, 0);
  const share = activeRoommates.length > 0 ? total / activeRoommates.length : 0;

  return activeRoommates.map((roommate) => {
    const paid = expenses
      .filter((expense) => expense.paidById === roommate.id)
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      roommateId: roommate.id,
      name: roommate.name,
      paid,
      fairShare: share,
      netBalance: Number((paid - share).toFixed(2)),
    };
  });
}

export function buildSettlementTracking(
  roommates: Roommate[] = [],
  expenses: Expense[] = [],
): SettlementTrackingItem[] {
  return buildSettlementSummary(roommates, expenses)
    .filter((item) => item.netBalance < 0)
    .map((item) => {
      const amountDue = Math.abs(item.netBalance);
      return {
        roommateId: item.roommateId,
        name: item.name,
        amountDue,
        settledAmount: 0,
        remaining: amountDue,
        status: 'Pending',
      };
    });
}

export function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function tomorrowDateString(date = new Date()) {
  const tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().slice(0, 10);
}
