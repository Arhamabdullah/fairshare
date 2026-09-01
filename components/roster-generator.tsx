'use client';

import { useMemo, useState } from 'react';
import { CleaningGroup, CookingAssignment, Roommate } from '@/lib/types';
import { generateCookingRoster } from '@/lib/roster';
import { getRoommateName } from '@/lib/utils';
import { useHouseData } from '@/hooks/use-house-data';

function randomiseCleaningGroups(memberIds: string[]): CleaningGroup[] {
  const ids = [...memberIds].sort(() => Math.random() - 0.5);
  return [
    {
      id: 'group-a',
      name: 'Group A',
      day: 'Tuesday',
      memberIds: ids.slice(0, Math.ceil(ids.length / 2)),
    },
    {
      id: 'group-b',
      name: 'Group B',
      day: 'Thursday',
      memberIds: ids.slice(Math.ceil(ids.length / 2)),
    },
  ];
}

type Props = {
  roommates?: Roommate[];
  onAssignmentsSave?: (assignments: CookingAssignment[]) => Promise<void> | void;
  onGroupsSave?: (groups: CleaningGroup[]) => Promise<void> | void;
};

export function RosterGenerator({ roommates: roommatesProp, onAssignmentsSave, onGroupsSave }: Props) {
  const hook = useHouseData();
  const sourceRoommates = roommatesProp ?? hook.roommates;
  const saveAssignments = onAssignmentsSave ?? hook.updateAssignments;
  const saveGroups = onGroupsSave ?? hook.updateGroups;
  const activeRoommates = sourceRoommates.filter((roommate) => roommate.isActive !== false);

  const [promptText, setPromptText] = useState('Arham should be Saturday or Sunday');
  const [negativePromptText, setNegativePromptText] = useState('');
  const [result, setResult] = useState(() =>
    generateCookingRoster('Arham should be Saturday or Sunday', '', activeRoommates),
  );
  const [groupState, setGroupState] = useState<CleaningGroup[]>(() =>
    randomiseCleaningGroups(activeRoommates.map((roommate) => roommate.id)),
  );

  const groupedPreview = useMemo(() => result.assignments.slice(0, 12), [result.assignments]);

  async function randomiseNow() {
    if (activeRoommates.length === 0) return;
    const generated = generateCookingRoster(promptText, negativePromptText, activeRoommates);
    const groups = randomiseCleaningGroups(activeRoommates.map((roommate) => roommate.id));
    setResult(generated);
    setGroupState(groups);
    await saveAssignments(generated.assignments);
    await saveGroups(groups);
  }

  return (
    <section className="glass card p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-2xl">
          <span className="pill">Roster AI</span>
          <h3 className="mt-3 text-2xl font-semibold text-main">Randomise cooking + cleaning roster</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            Admin can tap randomise to generate a fresh monthly roster. Use prompts for preferences and
            negative prompts for days to avoid.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={randomiseNow}
          disabled={activeRoommates.length === 0}
        >
          Randomise roster
        </button>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <label className="space-y-2 text-sm">
            <span className="text-muted-strong">Prompt / preferred rules</span>
            <textarea
              rows={4}
              value={promptText}
              onChange={(event) => setPromptText(event.target.value)}
              className="rounded-2xl px-4 py-3"
              placeholder="Example: Arham should be Saturday or Sunday"
            />
          </label>

          <label className="space-y-2 text-sm">
            <span className="text-muted-strong">Negative prompt / avoid rules</span>
            <textarea
              rows={4}
              value={negativePromptText}
              onChange={(event) => setNegativePromptText(event.target.value)}
              className="rounded-2xl px-4 py-3"
              placeholder={'Example: Ali avoid Monday\nHamza avoid Friday'}
            />
          </label>

          <div
            className="rounded-[24px] border p-4"
            style={{ borderColor: 'var(--line)', background: 'var(--surface-soft)' }}
          >
            <p className="text-sm font-semibold text-main">Constraint parsing preview</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Example supported text: “Arham should be Saturday or Sunday”, “Ali avoid Monday”, “Hamza not
              Friday”.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div
            className="rounded-[24px] border p-4"
            style={{ borderColor: 'var(--line)', background: 'var(--surface-soft)' }}
          >
            <div className="helper-row justify-between">
              <p className="font-semibold text-main">Generated cooking preview</p>
              <span className="pill-secondary">first 12 days</span>
            </div>

            <div className="mt-4 space-y-2">
              {groupedPreview.length > 0 ? (
                groupedPreview.map((assignment) => {
                  const weekday = new Date(`${assignment.date}T12:00:00`).toLocaleDateString('en-GB', {
                    weekday: 'long',
                  });
                  return (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between rounded-2xl border px-4 py-3"
                      style={{
                        borderColor: 'var(--line)',
                        background: 'color-mix(in srgb, var(--card) 72%, transparent)',
                      }}
                    >
                      <div>
                        <p className="font-medium text-main">
                          {getRoommateName(assignment.roommateId, activeRoommates)}
                        </p>
                        <p className="text-sm text-muted">{assignment.date}</p>
                      </div>
                      <span className="pill-secondary">{weekday}</span>
                    </div>
                  );
                })
              ) : (
                <div
                  className="rounded-2xl border px-4 py-6 text-sm text-muted"
                  style={{
                    borderColor: 'var(--line)',
                    background: 'color-mix(in srgb, var(--card) 72%, transparent)',
                  }}
                >
                  Add residents first, then randomise the roster.
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {groupState.map((group) => (
              <div
                key={group.name}
                className="rounded-[24px] border p-4"
                style={{ borderColor: 'var(--line)', background: 'var(--surface-soft)' }}
              >
                <div className="helper-row justify-between">
                  <p className="font-semibold text-main">{group.name}</p>
                  <span className="pill-secondary">{group.day}</span>
                </div>

                <div className="mt-3 space-y-2 text-sm text-muted-strong">
                  {group.memberIds.length > 0 ? (
                    group.memberIds.map((memberId) => (
                      <div
                        key={memberId}
                        className="rounded-xl px-3 py-2"
                        style={{ background: 'color-mix(in srgb, var(--card) 70%, transparent)' }}
                      >
                        {getRoommateName(memberId, activeRoommates)}
                      </div>
                    ))
                  ) : (
                    <div
                      className="rounded-xl px-3 py-2 text-muted"
                      style={{ background: 'color-mix(in srgb, var(--card) 70%, transparent)' }}
                    >
                      No members assigned yet
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
