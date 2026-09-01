type StatCardProps = {
  label: string;
  value: string;
  helpText?: string;
};

export function StatCard({ label, value, helpText }: StatCardProps) {
  return (
    <div className="glass card p-5">
      <p className="text-sm uppercase tracking-[0.22em] text-muted">{label}</p>
      <p className="stat-value mt-3">{value}</p>
      {helpText ? <p className="mt-3 text-sm text-muted">{helpText}</p> : null}
    </div>
  );
}
