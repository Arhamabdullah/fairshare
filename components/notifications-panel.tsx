'use client';

import { isFirebaseConfigured } from '@/lib/firebase/config';

export function NotificationsPanel() {
  return (
    <section className="glass card p-5">
      <span className="pill">Notifications</span>
      <h3 className="mt-3 text-2xl font-semibold text-main">Yes — this can notify the residents</h3>
      <p className="mt-2 text-sm leading-6 text-muted">
        The included Firebase scaffold supports browser push notifications with Firebase Cloud
        Messaging. You can notify roommates that tomorrow is their cooking day, tomorrow is their
        cleaning day, a new expense was added, or they still owe for this month.
      </p>

      <div className="mt-5 space-y-3">
        {[
          'Cooking reminder: send the day before the assigned cooking date.',
          'Cleaning reminder: send Monday night for Tuesday group and Wednesday night for Thursday group.',
          'Expense alert: notify everyone when a new grocery expense is logged.',
          'Settlement reminder: notify only roommates with remaining balances.',
        ].map((item) => (
          <div
            key={item}
            className="rounded-2xl border px-4 py-3 text-sm text-main"
            style={{ borderColor: 'var(--line)', background: 'var(--surface-soft)' }}
          >
            {item}
          </div>
        ))}
      </div>

      <div
        className="mt-5 rounded-[24px] border p-4"
        style={{
          borderColor: 'var(--line)',
          background: 'color-mix(in srgb, var(--card) 76%, transparent)',
        }}
      >
        <p className="font-semibold text-main">Current scaffold status</p>
        <p className="mt-2 text-sm leading-6 text-muted">
          {isFirebaseConfigured()
            ? 'Firebase keys detected in the client env. Finish FCM setup in Firebase Console and deploy the Cloud Functions folder.'
            : 'Add your Firebase env values in .env.local first. Then enable Firestore, Storage, Cloud Messaging, and deploy the functions folder.'}
        </p>
      </div>
    </section>
  );
}
