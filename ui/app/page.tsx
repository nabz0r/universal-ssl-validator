import { DashboardMetrics } from '@/components/DashboardMetrics';
import { CertificateValidator } from '@/components/CertificateValidator';
import { CertificateList } from '@/components/CertificateList';
import { AuditLog } from '@/components/AuditLog';

export default function DashboardPage() {
  return (
    <main className="flex min-h-screen flex-col p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">SSL Certificate Validator</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <DashboardMetrics />
      </div>

      <div className="mb-8">
        <CertificateValidator />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CertificateList />
        <AuditLog />
      </div>
    </main>
  );
}
