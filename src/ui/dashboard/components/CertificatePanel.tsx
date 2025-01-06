import React from 'react';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

export const CertificatePanel: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Certificate Status
        </h2>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          Validate New
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatusCard
          icon={<Shield className="h-6 w-6 text-green-500" />}
          label="Valid Certificates"
          value="156"
          trend="+12%"
          trendUp
        />

        <StatusCard
          icon={<AlertTriangle className="h-6 w-6 text-yellow-500" />}
          label="Expiring Soon"
          value="8"
          trend="-3%"
          trendUp={false}
        />

        <StatusCard
          icon={<CheckCircle className="h-6 w-6 text-blue-500" />}
          label="Monitored Domains"
          value="234"
          trend="+5%"
          trendUp
        />
      </div>
    </div>
  );
};

interface StatusCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
}

const StatusCard: React.FC<StatusCardProps> = ({ icon, label, value, trend, trendUp }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
      <div className="flex items-center">
        <div className="p-2 bg-white dark:bg-gray-700 rounded-lg">
          {icon}
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {label}
          </h3>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {value}
            </p>
            <span className={`ml-2 text-sm ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
              {trend}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
