"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  badge?: number;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
}

export default function Tabs({ tabs, defaultTab, onChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className="w-full">
      {/* Tab Headers */}
      <div className="border-b border-slate-200 bg-white rounded-t-2xl overflow-hidden">
        <div className="flex gap-1 p-2 overflow-x-auto scrollbar-hide flex-nowrap min-w-full">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`relative px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shrink-0 whitespace-nowrap text-sm ${isActive
                    ? 'text-sky-600 bg-sky-50 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                {tab.icon && <span className="w-5 h-5">{tab.icon}</span>}
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isActive ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                    {tab.badge}
                  </span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500"
                    transition={{ type: 'spring', duration: 0.3 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-b-2xl"
      >
        {activeTabContent}
      </motion.div>
    </div>
  );
}
