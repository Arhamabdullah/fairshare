'use client';

import { PageHeader } from '@/components/page-header';
import { useHouseData } from '@/hooks/use-house-data';
import { buildSettlementSummary, formatCurrency } from '@/lib/utils';

export default function SettlementsPage() {
  const { roommates, expenses } = useHouseData();
  const settlements = buildSettlementSummary(roommates, expenses);

  return (
    <div>
      <PageHeader
        title="Month-end settlements"
        description="See who overpaid groceries, who owes money, and use the admin console to mark who has already settled up."
      />

      <section className="glass card p-5">
        <div className="table-shell overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="py-3 pl-4 pr-4 font-medium">Roommate</th>
                <th className="py-3 pr-4 font-medium">Paid</th>
                <th className="py-3 pr-4 font-medium">Fair share</th>
                <th className="py-3 pr-4 font-medium">Net balance</th>
              </tr>
            </thead>
            <tbody>
              {settlements.map((item) => (
                <tr key={item.roommateId}>
                  <td className="py-4 pl-4 pr-4 font-medium text-main">{item.name}</td>
                  <td className="py-4 pr-4 text-muted-strong">{formatCurrency(item.paid)}</td>
                  <td className="py-4 pr-4 text-muted-strong">
                    {formatCurrency(item.fairShare)}
                  </td>
                  <td
                    className={`py-4 pr-4 font-semibold ${
                      item.netBalance >= 0 ? 'text-success' : 'text-danger'
                    }`}
                  >
                    {item.netBalance >= 0 ? 'Receives ' : 'Owes '}
                    {formatCurrency(Math.abs(item.netBalance))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
