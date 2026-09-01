import { AdminConsole } from '@/components/admin-console';
import { PageHeader } from '@/components/page-header';

export default function AdminPage() {
  return (
    <div>
      <PageHeader
        title="Admin console"
        description="Hardcoded admin login, live Firebase member management, settlement tracking, and roster randomisation with prompt and negative prompt support."
        tag="420_manager control room"
      />
      <AdminConsole />
    </div>
  );
}
