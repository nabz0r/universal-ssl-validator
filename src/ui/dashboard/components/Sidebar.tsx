import React from 'react';
import { Home, Shield, Activity, Database, Settings, Users } from 'lucide-react';

export const Sidebar: React.FC = () => {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
        <Shield className="h-8 w-8 text-indigo-600" />
        <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">SSL Validator</span>
      </div>
      
      <nav className="mt-6 px-4">
        <div className="space-y-2">
          <SidebarItem icon={<Home />} label="Dashboard" active />
          <SidebarItem icon={<Shield />} label="Certificates" />
          <SidebarItem icon={<Activity />} label="Monitoring" />
          <SidebarItem icon={<Database />} label="Audit Logs" />
          <SidebarItem icon={<Users />} label="Access Control" />
          <SidebarItem icon={<Settings />} label="Settings" />
        </div>
      </nav>
    </aside>
  );
};

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active }) => {
  return (
    <a
      href="#"
      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${active
        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400'
        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}
    >
      <span className="h-5 w-5">{icon}</span>
      <span className="ml-3">{label}</span>
    </a>
  );
};
