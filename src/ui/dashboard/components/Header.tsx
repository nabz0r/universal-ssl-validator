import React from 'react';
import { Bell, Settings } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex items-center justify-between h-16 px-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          SSL Validator Dashboard
        </h1>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
            <Bell className="h-5 w-5" />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
            <Settings className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">A</span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};
