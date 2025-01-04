import { DashboardLayout } from '../components/layouts/DashboardLayout';
import { CertificatesList } from '../components/CertificatesList';
import { EnergyMetrics } from '../components/EnergyMetrics';
import { SecurityOverview } from '../components/SecurityOverview';

export default function Home() {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        <SecurityOverview />
        <EnergyMetrics />
        <CertificatesList />
      </div>
    </DashboardLayout>
  );
}
