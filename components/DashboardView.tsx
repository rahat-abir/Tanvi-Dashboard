import React, { useState, useMemo } from 'react';
import {
    Mail, CheckCircle, MessageSquare, Snowflake, AlertCircle, Send, Filter,
    Star, ExternalLink, Loader2, Search, ChevronLeft, ChevronRight
} from 'lucide-react';
import StatCard from './StatCard';
import { EmailStats } from '../types';

interface Agent {
    name: string;
    payload: string;
}

interface ActivityRecord {
    "Name": string;
    "Email": string;
    "Company": string;
    "Job Title": string;
    "Lead Status": string;
    "Follow Up Status": string;
    "Time": string;
    "sent to tanvi": string;
}

interface DashboardViewProps {
    stats: EmailStats;
    agents: Agent[];
    selectedAgentName: string | null;
    activityData: ActivityRecord[];
    isLoading: boolean;
    agentSummary: { sent: number; replies: number } | null;
    onAgentClick: (agent: Agent) => void;
}

const ROWS_PER_PAGE = 50;

const DashboardView: React.FC<DashboardViewProps> = ({
    stats,
    agents,
    selectedAgentName,
    activityData,
    isLoading,
    agentSummary,
    onAgentClick
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [leadStatusFilter, setLeadStatusFilter] = useState<string>('all');
    const [followUpStatusFilter, setFollowUpStatusFilter] = useState<string>('all');

    const getLeadStatusStyle = (status: string) => {
        const s = status.toLowerCase();
        if (s.includes('replied')) return 'bg-red-100 text-red-700';
        if (s.includes('bounce')) return 'bg-pink-100 text-pink-700';
        if (s.includes('completed')) return 'bg-blue-100 text-blue-700';
        if (s.includes('cold')) return 'bg-green-100 text-green-700';
        if (s.includes('no email')) return 'bg-slate-100 text-slate-600';
        return 'bg-slate-100 text-slate-600';
    };

    const getFollowUpStatusStyle = (status: string) => {
        const s = status.toLowerCase();
        if (s.includes('three')) return 'bg-red-100 text-red-700';
        if (s.includes('two')) return 'bg-yellow-100 text-yellow-700';
        if (s.includes('one')) return 'bg-green-100 text-green-700';
        return 'bg-slate-100 text-slate-600';
    };

    // Extract unique status values for filter dropdowns
    const uniqueLeadStatuses = useMemo(() => {
        const statuses = new Set(activityData.map(record => record["Lead Status"]));
        return Array.from(statuses).sort();
    }, [activityData]);

    const uniqueFollowUpStatuses = useMemo(() => {
        const statuses = new Set(activityData.map(record => record["Follow Up Status"]));
        return Array.from(statuses).sort();
    }, [activityData]);

    const filteredActivities = useMemo(() => {
        return activityData.filter(record => {
            // Text search filter
            const query = searchQuery.toLowerCase();
            const matchesSearch = !searchQuery ||
                record["Name"].toLowerCase().includes(query) ||
                record["Email"].toLowerCase().includes(query) ||
                record["Company"].toLowerCase().includes(query) ||
                record["Job Title"].toLowerCase().includes(query) ||
                record["Lead Status"].toLowerCase().includes(query) ||
                record["Follow Up Status"].toLowerCase().includes(query);

            // Lead Status filter
            const matchesLeadStatus = leadStatusFilter === 'all' ||
                record["Lead Status"] === leadStatusFilter;

            // Follow-up Status filter
            const matchesFollowUpStatus = followUpStatusFilter === 'all' ||
                record["Follow Up Status"] === followUpStatusFilter;

            return matchesSearch && matchesLeadStatus && matchesFollowUpStatus;
        });
    }, [activityData, searchQuery, leadStatusFilter, followUpStatusFilter]);

    const totalItems = filteredActivities.length;
    const totalPages = Math.ceil(totalItems / ROWS_PER_PAGE);

    const paginatedActivities = useMemo(() => {
        const start = (currentPage - 1) * ROWS_PER_PAGE;
        return filteredActivities.slice(start, start + ROWS_PER_PAGE);
    }, [filteredActivities, currentPage]);

    return (
        <div className="space-y-10">
            <section>
                <div className="mb-6">
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Email Status Overview</h2>
                    <p className="text-slate-500 text-sm">Aggregated metrics from the loaded dataset.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                    <StatCard title="Total Email" value={stats.total.toLocaleString()} icon={<Mail size={22} />} colorClass="text-indigo-600" bgColorClass="bg-indigo-50" />
                    <StatCard title="Completed Email" value={stats.completed.toLocaleString()} percentage={`${((stats.completed / Math.max(stats.total, 1)) * 100).toFixed(1)}%`} icon={<CheckCircle size={22} />} colorClass="text-emerald-600" bgColorClass="bg-emerald-50" />
                    <StatCard title="Replied Email" value={stats.replied.toLocaleString()} percentage={`${((stats.replied / Math.max(stats.total, 1)) * 100).toFixed(1)}%`} icon={<MessageSquare size={22} />} colorClass="text-blue-600" bgColorClass="bg-blue-50" />
                    <StatCard title="Cold Email" value={stats.cold.toLocaleString()} percentage={`${((stats.cold / Math.max(stats.total, 1)) * 100).toFixed(1)}%`} icon={<Snowflake size={22} />} colorClass="text-amber-600" bgColorClass="bg-amber-50" />
                    <StatCard title="Bounced Email" value={stats.bounced.toLocaleString()} percentage={`${((stats.bounced / Math.max(stats.total, 1)) * 100).toFixed(1)}%`} icon={<AlertCircle size={22} />} colorClass="text-rose-600" bgColorClass="bg-rose-50" />
                    <StatCard title="Emails To Send" value={stats.emailsToSend.toLocaleString()} percentage={`${((stats.emailsToSend / Math.max(stats.total, 1)) * 100).toFixed(1)}%`} icon={<Send size={22} />} colorClass="text-purple-600" bgColorClass="bg-purple-50" />
                    <StatCard title="Send for LinkedIn" value={stats.linkedInSent.toLocaleString()} percentage={`${((stats.linkedInSent / Math.max(stats.total, 1)) * 100).toFixed(1)}%`} icon={<ExternalLink size={22} />} colorClass="text-sky-600" bgColorClass="bg-sky-50" />
                </div>
            </section>

            <section>
                <div className="mb-6">
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Campaign Agents</h2>
                    <p className="text-slate-500 text-sm">Select an agent to view their full activity table.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
                    {agents.map((agent) => {
                        const isActive = selectedAgentName === agent.name;
                        return (
                            <button
                                key={agent.name}
                                onClick={() => onAgentClick(agent)}
                                disabled={isActive && isLoading}
                                className={`
                  relative group flex items-center justify-between p-4 rounded-xl border transition-all duration-200 shadow-sm text-left
                  ${isActive
                                        ? 'bg-red-600 border-red-500 text-white scale-105 shadow-md shadow-red-200 z-10'
                                        : 'bg-white border-slate-100 text-slate-900 hover:bg-blue-600 hover:border-blue-500 hover:text-white hover:-translate-y-0.5'
                                    }
                  ${isLoading && !isActive ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                            >
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-lg tracking-tight leading-none">{agent.name}</h3>
                                    {isLoading && isActive && <Loader2 size={14} className="animate-spin opacity-70" />}
                                </div>
                                <div className={`p-1 rounded-full ${isActive ? 'bg-white text-red-600' : 'bg-slate-50 text-slate-200 group-hover:bg-white group-hover:text-blue-600'}`}>
                                    <Star size={12} fill="currentColor" />
                                </div>
                            </button>
                        );
                    })}
                </div>
            </section>

            {selectedAgentName && (
                <section className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
                        {isLoading && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center">
                                <Loader2 size={40} className="text-indigo-600 animate-spin mb-4" />
                                <p className="text-indigo-600 font-black tracking-widest text-[10px] uppercase">Processing {activityData.length} records...</p>
                            </div>
                        )}

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
                            <div className="space-y-3">
                                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Activity: {selectedAgentName}</h2>
                                <div className="flex flex-wrap gap-3">
                                    {/* Search Input */}
                                    <div className="relative min-w-[280px]">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Search by name, email..."
                                            value={searchQuery}
                                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
                                        />
                                    </div>

                                    {/* Lead Status Filter */}
                                    <div className="relative min-w-[200px]">
                                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                        <select
                                            value={leadStatusFilter}
                                            onChange={(e) => { setLeadStatusFilter(e.target.value); setCurrentPage(1); }}
                                            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all appearance-none cursor-pointer"
                                            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                                        >
                                            <option value="all">All Lead Status</option>
                                            {uniqueLeadStatuses.map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Follow-up Status Filter */}
                                    <div className="relative min-w-[200px]">
                                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                        <select
                                            value={followUpStatusFilter}
                                            onChange={(e) => { setFollowUpStatusFilter(e.target.value); setCurrentPage(1); }}
                                            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all appearance-none cursor-pointer"
                                            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                                        >
                                            <option value="all">All Follow-up Status</option>
                                            {uniqueFollowUpStatuses.map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="bg-slate-50 px-8 py-4 rounded-2xl border border-slate-100 text-center min-w-[120px]">
                                    <p className="text-[10px] uppercase font-black text-slate-400 mb-1 tracking-widest">TOTAL ITEMS</p>
                                    <p className="text-2xl font-black text-slate-900">{totalItems.toLocaleString()}</p>
                                </div>
                                <div className="bg-slate-50 px-8 py-4 rounded-2xl border border-slate-100 text-center min-w-[120px]">
                                    <p className="text-[10px] uppercase font-black text-slate-400 mb-1 tracking-widest">Replies</p>
                                    <p className="text-2xl font-black text-indigo-600">{agentSummary?.replies?.toLocaleString() || '0'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto rounded-2xl border border-slate-100">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">LEAD / RECIPIENT</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">COMPANY / TITLE</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">LEAD STATUS</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">FOLLOW UP STATUS</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">TIME</th>
                                        <th className="px-6 py-5 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {paginatedActivities.length > 0 ? (
                                        paginatedActivities.map((record, index) => (
                                            <tr key={`${record["Email"]}-${index}`} className="hover:bg-slate-50/30 transition-colors group">
                                                <td className="px-6 py-6">
                                                    <div className="font-bold text-sm text-slate-900 leading-tight mb-0.5">{record["Name"]}</div>
                                                    <div className="text-[10px] font-medium text-slate-400 lowercase tracking-wide">{record["Email"]}</div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className="font-bold text-sm text-slate-900 leading-tight mb-0.5">{record["Company"] !== '—' ? record["Company"] : <span className="text-slate-300 italic">No Company</span>}</div>
                                                    <div className="text-[10px] font-medium text-slate-400 lowercase tracking-wide">{record["Job Title"] !== '—' ? record["Job Title"] : <span className="text-slate-300 italic">No Title</span>}</div>
                                                </td>
                                                <td className="px-6 py-6 text-center">
                                                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${getLeadStatusStyle(record["Lead Status"])}`}>
                                                        {record["Lead Status"]}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-6 text-center">
                                                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${getFollowUpStatusStyle(record["Follow Up Status"])}`}>
                                                        {record["Follow Up Status"]}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-6 text-right text-[11px] font-bold text-slate-400 tabular-nums">
                                                    {record["Time"]}
                                                </td>
                                                <td className="px-6 py-6 text-right">
                                                    <button className="p-1.5 text-slate-200 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                                        <ExternalLink size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-20 text-center text-slate-300 font-medium italic">
                                                {isLoading ? 'Retrieving all data...' : 'No activity records found.'}
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
                </section>
            )}
        </div>
    );
};

export default DashboardView;
