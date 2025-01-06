import React from 'react';
import { Shield, AlertTriangle, Clock } from 'lucide-react';

interface Certificate {
  domain: string;
  status: 'valid' | 'warning' | 'expired';
  expiryDate: string;
  issuer: string;
}

const certificates: Certificate[] = [
  {
    domain: 'example.com',
    status: 'valid',
    expiryDate: '2024-12-31',
    issuer: 'Let\'s Encrypt'
  },
  {
    domain: 'test.org',
    status: 'warning',
    expiryDate: '2024-02-15',
    issuer: 'DigiCert'
  },
  {
    domain: 'dev.local',
    status: 'expired',
    expiryDate: '2024-01-01',
    issuer: 'GoDaddy SSL'
  }
];

export const CertificateList: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mt-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Certificates
        </h2>
        <div className="flex space-x-2">
          <button className="px-4 py-2 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">
            Filter
          </button>
          <button className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Add New
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <th className="px-6 py-3">Domain</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Expiry Date</th>
              <th className="px-6 py-3">Issuer</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {certificates.map((cert, index) => (
              <tr key={index} className="text-sm text-gray-900 dark:text-gray-300">
                <td className="px-6 py-4">{cert.domain}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={cert.status} />
                </td>
                <td className="px-6 py-4">{cert.expiryDate}</td>
                <td className="px-6 py-4">{cert.issuer}</td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button className="text-indigo-600 hover:text-indigo-900 dark:hover:text-indigo-400">
                      View
                    </button>
                    <button className="text-green-600 hover:text-green-900 dark:hover:text-green-400">
                      Renew
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface StatusBadgeProps {
  status: Certificate['status'];
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles = {
    valid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    expired: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  };

  const icons = {
    valid: <Shield className="w-4 h-4" />,
    warning: <AlertTriangle className="w-4 h-4" />,
    expired: <Clock className="w-4 h-4" />
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      <span className="mr-1.5">{icons[status]}</span>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};
