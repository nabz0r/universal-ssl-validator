import React from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useAuditLogs } from '../hooks/useAuditLogs';

export const AuditLogPanel: React.FC = () => {
  const { logs, loading } = useAuditLogs();

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mt-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mt-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Audit Logs
      </h2>

      <div className="space-y-4">
        {logs.map((log) => (
          <AuditLogItem key={log.id} log={log} />
        ))}
      </div>
    </div>
  );
};

const AuditLogItem: React.FC<{ log: any }> = ({ log }) => {
  const icons = {
    validation: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />
  };

  return (
    <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      <div className="flex-shrink-0">{icons[log.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {log.message}
        </p>
        <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
          <span>{new Date(log.timestamp).toLocaleString()}</span>
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
