'use client';

import { PageHeader } from '@/components/page-header';
import { useHouseData } from '@/hooks/use-house-data';
import { getRoommateName } from '@/lib/utils';

export default function CookingPage() {
  const { cookingAssignments, roommates } = useHouseData();

  return (
    <div>
      <PageHeader
        title="Cooking roster"
        description="Monthly cooking assignments stored in Firebase after the admin randomises the roster."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cookingAssignments.map((assignment) => {
          const weekday = new Date(`${assignment.date}T12:00:00`).toLocaleDateString('en-GB', {
            weekday: 'long',
          });
          return (
            <div key={assignment.id} className="glass card p-4">
              <div className="helper-row justify-between">
                <p className="text-sm text-muted">{assignment.date}</p>
                <span className="pill-secondary">{weekday}</span>
              </div>
              <p className="mt-3 text-xl font-semibold text-main">
                {getRoommateName(assignment.roommateId, roommates)}
              </p>
              <p className="mt-2 text-sm text-muted">Assigned cook for the day</p>
            </div>
          );
        })}
      </section>
    </div>
  );
}
