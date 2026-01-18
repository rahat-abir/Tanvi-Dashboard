import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface StatusDropdownProps {
    value: string;
    options: string[];
    onChange: (value: string) => void;
    getStyle: (status: string) => string;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({
    value,
    options,
    onChange,
    getStyle
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option: string) => {
        onChange(option);
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block w-48 group/dropdown" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
          w-full pl-4 pr-10 py-2 rounded-xl text-[11px] font-bold uppercase tracking-tight
          appearance-none cursor-pointer border transition-all duration-200 outline-none
          flex items-center justify-center relative
          ${getStyle(value)} 
          ${isOpen ? 'ring-2 ring-indigo-500/20 border-indigo-200' : 'border-transparent hover:shadow-md hover:border-slate-200'}
        `}
            >
                <span className="truncate">{value}</span>

                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                    <ChevronDown size={14} strokeWidth={2.5} />
                </div>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 origin-top">
                    <div className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
                        {options.map((option) => (
                            <button
                                key={option}
                                onClick={() => handleSelect(option)}
                                className={`
                  w-full text-center px-4 py-2.5 text-[10px] font-bold uppercase tracking-tight
                  transition-colors flex items-center justify-center
                  border-b border-dashed border-slate-50 last:border-0
                  ${getStyle(option)}
                  hover:brightness-95
                  ${value === option ? 'ring-1 ring-inset ring-black/5' : ''}
                `}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StatusDropdown;
