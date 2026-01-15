import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Linkedin, Send, CheckCircle, RefreshCcw, ListFilter, Copy, Check } from 'lucide-react';

export interface LinkedInRecord {
    "Name": string;
    "Job Title": string;
    "Company": string;
    "Email": string;
    "LinkedIn": string;
    "email to send": string;
    "done?": string;
}

interface LinkedInViewProps {
    activityData: LinkedInRecord[];
    isLoading: boolean;
    onRefresh: () => void;
    onUpdateStatus: (email: string, currentIsDone: boolean) => Promise<void>;
}

const ROWS_PER_PAGE = 50;

// Helper to determine if "done?" is true
const isDone = (status: string) => {
    const s = String(status || '').toLowerCase().trim();
    return s === '1' || s === 'sent';
};

const CopyableMessage = ({ text }: { text: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        if (!text || text === '—') return;
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    if (!text || text === '—') return <span className="text-slate-300 italic">—</span>;

    return (
        <div
            onClick={handleCopy}
            className="group relative cursor-pointer"
            title="Click to copy full message"
        >
            <div className={`
                font-mono text-xs p-3 rounded-lg border transition-all duration-200
                ${copied
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-[#0077b5] hover:bg-slate-100'}
            `}>
                <div className="flex items-start justify-between gap-3">
                    <p className="line-clamp-2 leading-relaxed max-w-[250px]">{text}</p>
                    <div className={`
                        shrink-0 transition-opacity duration-200
                        ${copied ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                    `}>
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                    </div>
                </div>
            </div>
            {copied && (
                <div className="absolute top-0 right-0 -mt-8 mr-2 px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded shadow-lg animate-in fade-in slide-in-from-bottom-2">
                    COPIED!
                </div>
            )}
        </div>
    );
};

const LinkedInView: React.FC<LinkedInViewProps> = ({ activityData, isLoading, onRefresh, onUpdateStatus }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [filterNotDone, setFilterNotDone] = useState(false);

    const filteredActivities = useMemo(() => {
        return activityData.filter(record => {
            if (filterNotDone && isDone(record["done?"])) {
                return false;
            }

            // Text search filter (Name, Company, Email)
            const query = searchQuery.toLowerCase();
            const matchesSearch = !searchQuery ||
                (record["Name"] || "").toLowerCase().includes(query) ||
                (record["Email"] || "").toLowerCase().includes(query) ||
                (record["Company"] || "").toLowerCase().includes(query);

            return matchesSearch;
        });
    }, [activityData, searchQuery, filterNotDone]);

    const totalItems = filteredActivities.length;
    const totalPages = Math.ceil(totalItems / ROWS_PER_PAGE);

    const paginatedActivities = useMemo(() => {
        const start = (currentPage - 1) * ROWS_PER_PAGE;
        return filteredActivities.slice(start, start + ROWS_PER_PAGE);
    }, [filteredActivities, currentPage]);



    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="space-y-3">
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
                            <span className="bg-[#0077b5] text-white p-2 rounded-lg"><Linkedin size={32} /></span>
                            LinkedIn Prospecting
                        </h2>
                        <p className="text-slate-500">Search for prospects and view LinkedIn specific details.</p>
                    </div>
                    <button
                        onClick={onRefresh}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RefreshCcw size={18} className={`${isLoading ? 'animate-spin' : ''}`} />
                        {isLoading ? 'Refreshing...' : 'Refresh Data'}
                    </button>
                </div>

                <div className="mb-8 relative z-10">
                    <div className="relative max-w-2xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name, company, or email..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#0077b5]/20 focus:border-[#0077b5] transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-100 relative min-h-[400px]">
                    {isLoading && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center">
                            <div className="animate-spin text-[#0077b5] mb-2">
                                <Linkedin size={40} />
                            </div>
                            <p className="text-[#0077b5] font-black tracking-widest text-xs uppercase">Fetching LinkedIn Data...</p>
                        </div>
                    )}

                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">LEAD / RECIPIENT</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">COMPANY / TITLE</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">LINKEDIN LINKS</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">MESSAGE TO SEND</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        SEND DONE?
                                        <button
                                            onClick={() => setFilterNotDone(prev => !prev)}
                                            className={`transition-colors ${filterNotDone ? 'text-[#0077b5]' : 'text-slate-300 hover:text-slate-500'}`}
                                            title={filterNotDone ? "Show All" : "Show Not Done Only"}
                                        >
                                            <ListFilter size={14} />
                                        </button>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {paginatedActivities.length > 0 ? (
                                paginatedActivities.map((record, index) => (
                                    <tr key={`${record["Email"]}-${index}`} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-6 py-6 max-w-[250px] truncate">
                                            <div className="font-bold text-sm text-slate-900 leading-tight mb-0.5 truncate" title={record["Name"]}>{record["Name"]}</div>
                                            <div className="text-[10px] font-medium text-slate-400 lowercase tracking-wide truncate" title={record["Email"]}>{record["Email"]}</div>
                                        </td>
                                        <td className="px-6 py-6 max-w-[250px] truncate">
                                            <div className="font-bold text-sm text-slate-900 leading-tight mb-0.5 truncate" title={record["Company"]}>{record["Company"] !== '—' ? record["Company"] : <span className="text-slate-300 italic">No Company</span>}</div>
                                            <div className="text-[10px] font-medium text-slate-400 lowercase tracking-wide truncate" title={record["Job Title"]}>{record["Job Title"] !== '—' ? record["Job Title"] : <span className="text-slate-300 italic">No Title</span>}</div>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            {record["LinkedIn"] && record["LinkedIn"] !== '—' ? (
                                                <a
                                                    href={record["LinkedIn"]}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#0077b5] text-white rounded-lg text-xs font-bold hover:bg-[#006097] transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                                                >
                                                    <Linkedin size={14} /> Open
                                                </a>
                                            ) : (
                                                <span className="text-slate-300 text-xs italic">No Link</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-6" style={{ minWidth: '300px' }}>
                                            <CopyableMessage text={record["email to send"]} />
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <button
                                                onClick={() => onUpdateStatus(record["Email"], isDone(record["done?"]))}
                                                className={`p-2 rounded-lg transition-all shadow-sm ${isDone(record["done?"])
                                                    ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                                                    : 'bg-slate-100 text-slate-300 hover:bg-[#0077b5] hover:text-white hover:shadow-md'
                                                    }`}
                                                title={isDone(record["done?"]) ? "Marked as Done" : "Mark as Done"}
                                            >
                                                <CheckCircle size={18} fill={isDone(record["done?"]) ? "currentColor" : "none"} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-slate-300 font-medium italic">
                                        {isLoading ? 'Retrieving LinkedIn data...' : (activityData.length === 0 ? 'No LinkedIn records loaded.' : 'No records match your search.')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
                        <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">
                            Showing {((currentPage - 1) * ROWS_PER_PAGE) + 1}-{Math.min(currentPage * ROWS_PER_PAGE, totalItems)} of {totalItems.toLocaleString()} records
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-slate-100 text-slate-400 hover:bg-slate-50 disabled:opacity-30 transition-all flex items-center gap-2 px-4"
                            >
                                <ChevronLeft size={18} /> <span className="text-xs font-bold">PREVIOUS</span>
                            </button>
                            <span className="text-xs font-bold text-slate-600 px-3">Page {currentPage} of {totalPages}</span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-slate-100 text-slate-400 hover:bg-slate-50 disabled:opacity-30 transition-all flex items-center gap-2 px-4"
                            >
                                <span className="text-xs font-bold">NEXT</span> <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LinkedInView;
