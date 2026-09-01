'use client';

import { AddExpenseForm } from '@/components/add-expense-form';
import { PageHeader } from '@/components/page-header';
import { useHouseData } from '@/hooks/use-house-data';
import { formatCurrency, getRoommateName } from '@/lib/utils';

export default function ExpensesPage() {
  const { roommates, expenses, createExpense } = useHouseData();

  return (
    <div>
      <PageHeader
        title="Expenses"
        description="Add grocery spending and persist it to Firestore. Receipt selection is placeholder-only in this build."
      />

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <AddExpenseForm roommates={roommates} onSubmitExpense={createExpense} />

        <section className="glass card p-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-semibold text-main">All grocery expenses</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Receipt filenames can be noted here. This build does not upload files to Firebase Storage.
              </p>
            </div>
            <span className="pill">Expense ledger</span>
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
      </div>
    </div>
  );
}
