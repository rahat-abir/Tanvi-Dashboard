import React from 'react';
import { LayoutDashboard, Linkedin, Search } from 'lucide-react';

interface NavbarProps {
    currentView: 'dashboard' | 'linkedin' | 'system-search';
    onViewChange: (view: 'dashboard' | 'linkedin' | 'system-search') => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, onViewChange }) => {
    return (
        <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50">
            <div className="max-w-[1600px] mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-600 text-white p-2 rounded-lg">
                        <LayoutDashboard size={20} />
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Email Analytics Pro</h1>
                </div>

                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                    <button
                        onClick={() => onViewChange('dashboard')}
                        className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all
              ${currentView === 'dashboard'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}
            `}
                    >
                        <LayoutDashboard size={16} />
                        Dashboard
                    </button>
                    <button
                        onClick={() => onViewChange('linkedin')}
                        className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all
              ${currentView === 'linkedin'
                                ? 'bg-white text-[#0077b5] shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}
            `}
                    >
                        <Linkedin size={16} />
                        LinkedIn
                    </button>
                    <button
                        onClick={() => onViewChange('system-search')}
                        className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all
              ${currentView === 'system-search'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}
            `}
                    >
                        <Search size={16} />
                        System Search
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
