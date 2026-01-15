
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  percentage?: string;
  icon: React.ReactNode;
  colorClass: string;
  bgColorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, percentage, icon, colorClass, bgColorClass }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${bgColorClass} ${colorClass}`}>
          {icon}
        </div>
        {percentage && (
          <span className={`text-sm font-semibold px-2.5 py-0.5 rounded-full ${bgColorClass} ${colorClass}`}>
            {percentage}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      </div>
    </div>
  );
};

export default StatCard;
