import React from 'react';
import { LogEntry } from '../types';

interface Props {
  log: LogEntry[];
}

const typeStyles: Record<LogEntry['type'], string> = {
  info: 'text-gray-300 border-l-gray-500',
  success: 'text-green-300 border-l-green-500',
  warning: 'text-yellow-300 border-l-yellow-500',
  danger: 'text-red-300 border-l-red-500',
  breakthrough: 'text-amber-200 border-l-amber-400 bg-amber-900/20',
};

export const EventLog: React.FC<Props> = ({ log }) => {
  return (
    <div className="bg-gray-900/80 backdrop-blur-sm border border-purple-900/50 rounded-xl p-4 shadow-lg shadow-purple-900/20">
      <h3 className="text-lg font-bold text-purple-200 mb-3 flex items-center gap-2">
        <span>📖</span> Chronicle
      </h3>
      
      <div className="space-y-1 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
        {log.map(entry => (
          <div 
            key={entry.id}
            className={`text-sm py-1.5 px-2 rounded border-l-2 ${typeStyles[entry.type]} transition-all`}
          >
            <span className="text-xs text-gray-600 mr-2">
              {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {entry.message}
          </div>
        ))}
      </div>
    </div>
  );
};
