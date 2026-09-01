'use client';

import { PageHeader } from '@/components/page-header';
import { useHouseData } from '@/hooks/use-house-data';
import { getRoommateName } from '@/lib/utils';

export default function CleaningPage() {
  const { cleaningGroups, roommates } = useHouseData();

  return (
    <div>
      <PageHeader
        title="Cleaning groups"
        description="Two groups: one for Tuesday and one for Thursday. The admin console can reshuffle these groups and save them to Firebase."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {cleaningGroups.map((group) => (
          <section key={group.name} className="glass card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-main">{group.name}</h3>
                <p className="mt-2 text-sm text-muted">Cleaning day: {group.day}</p>
              </div>
              <span className="pill-secondary">{group.memberIds.length} members</span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {group.memberIds.map((memberId) => (
                <div
                  key={memberId}
                  className="rounded-2xl border px-4 py-3 text-sm font-medium text-main"
                  style={{ borderColor: 'var(--line)', background: 'var(--surface-soft)' }}
                >
                  {getRoommateName(memberId, roommates)}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
