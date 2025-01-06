import React from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

interface AuditLog {
  type: 'validation' | 'error' | 'info';
  message: string;
  timestamp: string;
  domain?: string;
}

const auditLogs: AuditLog[] = [
  {
    type: 'validation',
    message: 'Certificate validation successful',
    timestamp: '2024-01-06 14:23:15',
    domain: 'example.com'
  },
  {
    type: 'error',
    message: 'Certificate renewal failed',
    timestamp: '2024-01-06 14:20:00',
    domain: 'test.org'
  },
  {
    type: 'info',
    message: 'System update completed',
    timestamp: '2024-01-06 14:15:30'
  }
];

export const AuditLogPanel: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mt-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Audit Logs
      </h2>

      <div className="space-y-4">
        {auditLogs.map((log, index) => (
          <AuditLogItem key={index} log={log} />
        ))}
      </div>
    </div>
  );
};

interface AuditLogItemProps {
  log: AuditLog;
}

const AuditLogItem: React.FC<AuditLogItemProps> = ({ log }) => {
  const icons = {
    validation: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />
  };

  return (
    <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      <div className="flex-shrink-0">{icons[log.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {log.message}
        </p>
        <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
          <span>{log.timestamp}</span>
          {log.domain && (
            <>
              <span className="mx-2">•</span>
              <span>{log.domain}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
