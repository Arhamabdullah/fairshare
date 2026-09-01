'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { adminCredentials } from '@/lib/mock-data';
import { SettlementControlBoard } from './settlement-control-board';
import { RosterGenerator } from './roster-generator';
import { useHouseData } from '@/hooks/use-house-data';
import { NotificationsPanel } from './notifications-panel';

const ADMIN_STORAGE_KEY = 'roommates420_admin';

export function AdminConsole() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const useHouse = useHouseData();
  const { roommates, createRoommate, deleteRoommate, backendReady } = useHouse;

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.localStorage.getItem(ADMIN_STORAGE_KEY) === 'true'
    ) {
      setIsLoggedIn(true);
    }
  }, []);

  const activeRoommates = useMemo(
    () => roommates.filter((roommate) => roommate.isActive !== false),
    [roommates],
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (username === adminCredentials.username && password === adminCredentials.password) {
      setIsLoggedIn(true);
      setError('');
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
      }
      return;
    }
    setError('Login failed. Use 420_manager / Admin42069');
  }

  function handleLogout() {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(ADMIN_STORAGE_KEY);
    }
  }

  async function handleAddMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!memberName.trim()) return;
    await createRoommate({ name: memberName.trim(), email: memberEmail.trim() });
    setMemberName('');
    setMemberEmail('');
  }

  if (!isLoggedIn) {
    return (
      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="glass card p-6 md:p-7">
          <span className="pill">420 residents admin</span>
          <h3 className="mt-4 text-3xl font-black gradient-title">
            Manage residents, expenses, settlements, and rosters from one place
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            Log in as the house admin to add or remove members, track grocery payments, update
            settlement status, randomise monthly cooking duties, and manage Tuesday/Thursday
            cleaning groups.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              ['Admin access', 'Hardcoded username/password exactly as requested.'],
              ['Members', 'Add or deactivate residents from the admin panel.'],
              ['Roster rules', 'Use prompt and negative prompt rules while randomising duties.'],
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
        </div>

        <form onSubmit={handleSubmit} className="glass card space-y-5 p-6">
          <div>
            <span className="pill-secondary">Admin credentials</span>
            <h3 className="mt-4 text-2xl font-semibold text-main">Admin login</h3>
            <p className="mt-2 text-sm text-muted">
              Username: 420_manager
              <br />
              Password: Admin42069
            </p>
          </div>

          <label className="space-y-2 text-sm">
            <span className="text-muted-strong">Username</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="rounded-2xl px-4 py-3"
              required
            />
          </label>

          <label className="space-y-2 text-sm">
            <span className="text-muted-strong">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-2xl px-4 py-3"
              required
            />
          </label>

          <button type="submit" className="btn-primary w-full">
            Enter admin console
          </button>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
        </form>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass card p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="pill">Admin active</span>
            <h3 className="mt-3 text-2xl font-semibold text-main">Welcome back, 420 manager</h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              {backendReady
                ? 'Firebase is connected and the app is using live data.'
                : 'Firebase keys are missing, so data will not persist until .env.local is configured.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn-secondary" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="glass card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="pill">Member manager</span>
              <h3 className="mt-3 text-2xl font-semibold text-main">Add or remove residents</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Keep the house list current before splitting groceries or randomising rosters.
              </p>
            </div>
            <span className="pill-secondary">{activeRoommates.length} active</span>
          </div>

          <form onSubmit={handleAddMember} className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
            <input
              value={memberName}
              onChange={(event) => setMemberName(event.target.value)}
              placeholder="New member name"
              className="rounded-2xl px-4 py-3"
              required
            />
            <input
              value={memberEmail}
              onChange={(event) => setMemberEmail(event.target.value)}
              placeholder="Email or label (optional)"
              className="rounded-2xl px-4 py-3"
            />
            <button type="submit" className="btn-primary">
              Add member
            </button>
          </form>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {activeRoommates.length > 0 ? (
              activeRoommates.map((roommate) => (
                <div
                  key={roommate.id}
                  className="rounded-[24px] border p-4"
                  style={{ borderColor: 'var(--line)', background: 'var(--surface-soft)' }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-main">{roommate.name}</p>
                      <p className="mt-1 text-sm text-muted">{roommate.email || 'No email added'}</p>
                    </div>
                    <button
                      type="button"
                      className="text-sm text-danger"
                      onClick={() => deleteRoommate(roommate.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div
                className="rounded-[24px] border p-4 text-sm text-muted"
                style={{ borderColor: 'var(--line)', background: 'var(--surface-soft)' }}
              >
                No active residents yet. Add your first member to get started.
              </div>
            )}
          </div>
        </div>

        <NotificationsPanel />
      </section>

      <SettlementControlBoard rows={useHouse.settlements} onUpdateRow={useHouse.updateSettlement} />
      <RosterGenerator
        roommates={useHouse.roommates}
        onAssignmentsSave={useHouse.updateAssignments}
        onGroupsSave={useHouse.updateGroups}
      />
    </div>
  );
}
