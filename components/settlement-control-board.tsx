'use client';

import { useMemo } from 'react';
import { formatCurrency } from '@/lib/utils';
import { SettlementStatus, SettlementTrackingItem } from '@/lib/types';
import { useHouseData } from '@/hooks/use-house-data';

const statuses: SettlementStatus[] = ['Pending', 'Partial', 'Paid'];

type Props = {
  rows?: SettlementTrackingItem[];
  onUpdateRow?: (row: SettlementTrackingItem) => Promise<void> | void;
};

export function SettlementControlBoard({ rows: rowsProp, onUpdateRow }: Props) {
  const hook = useHouseData();
  const rows = rowsProp ?? hook.settlements;
  const updateFn = onUpdateRow ?? hook.updateSettlement;

  const totals = useMemo(() => {
    const expected = rows.reduce((sum, row) => sum + row.amountDue, 0);
    const collected = rows.reduce((sum, row) => sum + row.settledAmount, 0);
    const remaining = rows.reduce((sum, row) => sum + row.remaining, 0);
    return { expected, collected, remaining };
  }, [rows]);

  function updateRow(original: SettlementTrackingItem, updates: Partial<SettlementTrackingItem>) {
    const next = { ...original, ...updates };
    const settledAmount = Math.min(next.amountDue, Math.max(0, Number(next.settledAmount)));
    const remaining = Math.max(0, Number((next.amountDue - settledAmount).toFixed(2)));
    const status = updates.status
      ? updates.status
      : remaining === 0
        ? 'Paid'
        : settledAmount > 0
          ? 'Partial'
          : 'Pending';

    void updateFn({ ...next, settledAmount, remaining, status });
  }

  return (
    <section className="glass card p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <span className="pill">Settlement tracker</span>
          <h3 className="mt-3 text-2xl font-semibold text-main">Admin collection board</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Mark who has paid the month-end settlement, how much has already been collected, and whose
            amount is still remaining.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm md:min-w-[360px]">
          <div
            className="rounded-2xl border p-3"
            style={{ borderColor: 'var(--line)', background: 'var(--surface-soft)' }}
          >
            <p className="text-muted">Expected</p>
            <p className="mt-2 font-semibold text-main">{formatCurrency(totals.expected)}</p>
          </div>
          <div
            className="rounded-2xl border p-3"
            style={{ borderColor: 'var(--line)', background: 'var(--surface-soft)' }}
          >
            <p className="text-muted">Collected</p>
            <p className="mt-2 font-semibold text-success">{formatCurrency(totals.collected)}</p>
          </div>
          <div
            className="rounded-2xl border p-3"
            style={{ borderColor: 'var(--line)', background: 'var(--surface-soft)' }}
          >
            <p className="text-muted">Remaining</p>
            <p className="mt-2 font-semibold text-danger">{formatCurrency(totals.remaining)}</p>
          </div>
        </div>
      </div>

      <div className="table-shell mt-5 overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th className="py-3 pl-4 pr-4 font-medium">Roommate</th>
              <th className="py-3 pr-4 font-medium">Amount due</th>
              <th className="py-3 pr-4 font-medium">Settled</th>
              <th className="py-3 pr-4 font-medium">Remaining</th>
              <th className="py-3 pr-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <tr key={row.roommateId}>
                  <td className="py-4 pl-4 pr-4 font-medium text-main">{row.name}</td>
                  <td className="py-4 pr-4 text-muted-strong">{formatCurrency(row.amountDue)}</td>
                  <td className="py-4 pr-4">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={row.amountDue}
                      value={row.settledAmount}
                      onChange={(event) => updateRow(row, { settledAmount: Number(event.target.value) })}
                      className="max-w-[130px] rounded-2xl px-3 py-2"
                    />
                  </td>
                  <td className="py-4 pr-4 text-danger">{formatCurrency(row.remaining)}</td>
                  <td className="py-4 pr-4">
                    <select
                      value={row.status}
                      onChange={(event) => updateRow(row, { status: event.target.value as SettlementStatus })}
                      className="max-w-[150px] rounded-2xl px-3 py-2"
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-10 text-center text-sm text-muted">
                  No outstanding balances yet. Add expenses first and settlement rows will appear automatically.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
