export type Roommate = {
  id: string;
  name: string;
  email: string;
  pushToken?: string;
  isActive?: boolean;
  createdAt?: string;
};

export type Expense = {
  id: string;
  date: string;
  amount: number;
  paidById: string;
  note: string;
  receiptName?: string;
  receiptUrl?: string;
  createdAt?: string;
};

export type CookingAssignment = {
  id: string;
  date: string;
  roommateId: string;
  notified?: boolean;
};

export type CleaningGroup = {
  id?: string;
  name: 'Group A' | 'Group B';
  day: 'Tuesday' | 'Thursday';
  memberIds: string[];
};

export type SettlementStatus = 'Pending' | 'Partial' | 'Paid';

export type SettlementTrackingItem = {
  roommateId: string;
  name: string;
  amountDue: number;
  settledAmount: number;
  remaining: number;
  status: SettlementStatus;
  updatedAt?: string;
  notified?: boolean;
};

export type RosterConstraint = {
  roommateId: string;
  allowDays?: string[];
  avoidDays?: string[];
};

export type NotificationPreference = {
  id: string;
  roommateId: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  expenseAlerts: boolean;
  cookingAlerts: boolean;
  cleaningAlerts: boolean;
  settlementAlerts: boolean;
};

export type HouseData = {
  roommates: Roommate[];
  expenses: Expense[];
  settlements: SettlementTrackingItem[];
  cookingAssignments: CookingAssignment[];
  cleaningGroups: CleaningGroup[];
};
