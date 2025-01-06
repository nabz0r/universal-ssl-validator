import React from 'react';
import { DashboardLayout } from '../DashboardLayout';
import { CertificatePanel } from '../components/CertificatePanel';
import { MonitoringPanel } from '../components/MonitoringPanel';
import { ValidationForm } from '../components/ValidationForm';
import { CertificateList } from '../components/CertificateList';
import { AuditLogPanel } from '../components/AuditLogPanel';

export const DashboardHome: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CertificatePanel />
            <MonitoringPanel />
            <CertificateList />
          </div>
          <div>
            <ValidationForm />
            <AuditLogPanel />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
