'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import { Roommate } from '@/lib/types';

type Props = {
  roommates: Roommate[];
  onSubmitExpense: (input: {
    date: string;
    amount: number;
    paidById: string;
    note: string;
    file?: File | null;
  }) => Promise<void>;
};

export function AddExpenseForm({ roommates, onSubmitExpense }: Props) {
  const [message, setMessage] = useState('');
  const [receiptName, setReceiptName] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  function handleReceiptChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setReceiptFile(file);
    setReceiptName(file?.name ?? '');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    await onSubmitExpense({
      date: String(formData.get('date')),
      amount: Number(formData.get('amount')),
      paidById: String(formData.get('paidById')),
      note: String(formData.get('note') ?? ''),
      file: receiptFile,
    });

    setMessage(receiptFile ? 'Expense saved. Receipt placeholder noted.' : 'Expense saved.');
    setReceiptName('');
    setReceiptFile(null);
    event.currentTarget.reset();
  }

  return (
    <form onSubmit={handleSubmit} className="glass card space-y-5 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <span className="pill">New expense</span>
          <h3 className="mt-3 text-2xl font-semibold text-main">Add grocery expense</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            Log the amount, who paid, what was bought, and optionally note a receipt or screenshot.
          </p>
        </div>
        <div
          className="rounded-2xl border px-3 py-2 text-right text-xs"
          style={{
            borderColor: 'var(--line)',
            background: 'var(--surface-soft)',
            color: 'var(--muted-strong)',
          }}
        >
          <div>{roommates.length} roommates</div>
          <div>Equal grocery split</div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span className="text-muted-strong">Date</span>
          <input name="date" type="date" className="rounded-2xl px-4 py-3" required />
        </label>

        <label className="space-y-2 text-sm">
          <span className="text-muted-strong">Amount</span>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            className="rounded-2xl px-4 py-3"
            required
          />
        </label>

        <label className="space-y-2 text-sm md:col-span-2">
          <span className="text-muted-strong">Paid by</span>
          <select name="paidById" className="rounded-2xl px-4 py-3" required defaultValue="">
            <option value="">Select roommate</option>
            {roommates.map((roommate) => (
              <option key={roommate.id} value={roommate.id}>
                {roommate.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm md:col-span-2">
          <span className="text-muted-strong">Note</span>
          <textarea
            name="note"
            rows={3}
            placeholder="What did you buy?"
            className="rounded-2xl px-4 py-3"
          />
        </label>

        <div className="space-y-2 text-sm md:col-span-2">
          <span className="text-muted-strong">Receipt or screenshot</span>
          <label className="upload-zone block cursor-pointer">
            <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleReceiptChange} />
            <div className="flex flex-col gap-2">
              <span className="text-base font-semibold text-main">Select receipt file</span>
              <span className="text-muted">
                Placeholder only for now. File is not uploaded to Firebase Storage.
              </span>
              <span className="font-medium text-accent">{receiptName || 'No file selected yet'}</span>
            </div>
          </label>
        </div>
      </div>

      <button type="submit" className="btn-primary w-full" disabled={roommates.length === 0}>
        Save expense
      </button>
      {roommates.length === 0 ? (
        <p className="text-sm text-danger">Add at least one roommate before saving an expense.</p>
      ) : null}
      {message ? <p className="text-sm text-success">{message}</p> : null}
    </form>
  );
}
