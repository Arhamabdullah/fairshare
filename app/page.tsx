'use client';

import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { useHouseData } from '@/hooks/use-house-data';
import { buildSettlementSummary, formatCurrency, getRoommateName } from '@/lib/utils';

export default function DashboardPage() {
  const { expenses, cookingAssignments, roommates } = useHouseData();
  const settlements = buildSettlementSummary(roommates, expenses);
  const totalGroceries = expenses.reduce((sum, item) => sum + item.amount, 0);
  const fairShare = settlements[0]?.fairShare ?? 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextCook =
    [...cookingAssignments]
      .filter((assignment) => {
        const assignmentDate = new Date(`${assignment.date}T00:00:00`);
        assignmentDate.setHours(0, 0, 0, 0);
        return assignmentDate >= today;
      })
      .sort(
        (a, b) =>
          new Date(`${a.date}T00:00:00`).getTime() -
          new Date(`${b.date}T00:00:00`).getTime(),
      )[0] ?? null;

  const topContributor = [...settlements].sort((a, b) => b.paid - a.paid)[0];
  const amountOutstanding = settlements
    .filter((row) => row.netBalance < 0)
    .reduce((sum, row) => sum + Math.abs(row.netBalance), 0);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Live house command center for expenses, settlements, cooking roster, and cleaning groups."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="This month total"
          value={formatCurrency(totalGroceries)}
          helpText="All grocery receipts combined"
        />
        <StatCard
          label="Equal share per person"
          value={formatCurrency(fairShare)}
          helpText={`Split across ${roommates.length} roommates`}
        />
        <StatCard
          label="Next cooking duty"
          value={nextCook ? getRoommateName(nextCook.roommateId, roommates) : 'Not set'}
          helpText={
            nextCook
              ? new Date(`${nextCook.date}T12:00:00`).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Generate roster'
          }
        />
        <StatCard
          label="Outstanding settlements"
          value={formatCurrency(amountOutstanding)}
          helpText={topContributor ? `Top payer: ${topContributor.name}` : 'No data yet'}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="glass card p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-main">Recent expenses</h3>
              <p className="mt-1 text-sm text-muted">
                Every uploaded receipt is linked to the expense record in Firebase Storage.
              </p>
            </div>
            <span className="pill">Live data</span>
          </div>

          <div className="table-shell overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="py-3 pl-4 pr-4 font-medium">Date</th>
                  <th className="py-3 pr-4 font-medium">Paid by</th>
                  <th className="py-3 pr-4 font-medium">Note</th>
                  <th className="py-3 pr-4 font-medium">Receipt</th>
                  <th className="py-3 pr-4 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length > 0 ? (
                  expenses.map((expense) => (
                    <tr key={expense.id}>
                      <td className="py-4 pl-4 pr-4 text-muted-strong">{expense.date}</td>
                      <td className="py-4 pr-4 text-main">
                        {getRoommateName(expense.paidById, roommates)}
                      </td>
                      <td className="py-4 pr-4 text-muted">{expense.note}</td>
                      <td className="py-4 pr-4 text-accent">{expense.receiptName || '—'}</td>
                      <td className="py-4 pr-4 font-semibold text-main">
                        {formatCurrency(expense.amount)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-sm text-muted">
                      No expenses added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="glass card p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-main">System overview</h3>
              <p className="mt-1 text-sm text-muted">
                Everything in this build is wired for live Firebase data.
              </p>
            </div>
            <span className="pill-secondary">Backend live</span>
          </div>

          <div className="space-y-3">
            {[
              ['Roommates', 'Add or remove active residents from the admin console.'],
              ['Expenses', 'Store grocery costs with receipt uploads in Firebase Storage.'],
              ['Rosters', 'Randomise monthly cooking duties and Tuesday/Thursday cleaning groups.'],
            ].map(([title, description]) => (
              <div
                key={title}
                className="rounded-[24px] border p-4"
                style={{ borderColor: 'var(--line)', background: 'var(--surface-soft)' }}
              >
                <p className="font-semibold text-main">{title}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
