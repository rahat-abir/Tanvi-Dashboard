import React, { useState } from 'react';
import { Search, Loader2, Filter } from 'lucide-react';

interface SystemSearchRecord {
    "LEAD / RECIPIENT": string;
    "COMPANY / TITLE": string;
    "LEAD STATUS": string;
    "FOLLOW UP STATUS": string;
    "TIME": string;
    "AGENT": string;
}

const FUNNY_LOADING_QUOTES = [
    "Searching the entire universe... please hold.",
    "Asking the hamsters to run faster...",
    "Consulting the oracle...",
    "Digging through the archives...",
    "Summoning the data spirits...",
    "Scanning for signs of intelligent life...",
    "Brewing a fresh pot of data...",
    "Untangling the interwebs...",
    "Poking the server with a stick...",
    "Counting to infinity... twice..."
];

const SEARCH_WEBHOOK_URL = 'https://layerland.app.n8n.cloud/webhook/6d12ab20-b90c-4bc8-9ca8-0a66daab1a49';

const SystemSearchView: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingQuote, setLoadingQuote] = useState(FUNNY_LOADING_QUOTES[0]);
    const [hasSearched, setHasSearched] = useState(false);

    // Filters (mock for now as backend integration is later)
    const [leadStatusFilter, setLeadStatusFilter] = useState('all');
    const [followUpStatusFilter, setFollowUpStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        setHasSearched(true);
        setResults([]); // Clear previous results

        // Cycle quotes
        const quoteInterval = setInterval(() => {
            setLoadingQuote(FUNNY_LOADING_QUOTES[Math.floor(Math.random() * FUNNY_LOADING_QUOTES.length)]);
        }, 2000);

        try {
            const response = await fetch(SEARCH_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: searchQuery }),
            });

            if (!response.ok) throw new Error('Search failed');

            const rawData = await response.json();
            console.log('Search Results:', rawData);

            let records: any[] = [];
            if (Array.isArray(rawData)) {
                records = rawData;
            } else if (rawData && typeof rawData === 'object') {
                records = [rawData];
            }

            // Clean records to ensure fields exist
            const cleanedRecords = records.map(record => ({
                Name: record["Name"] || '—',
                Email: record["Email"] || '—',
                Company: record["Company"] || '—',
                JobTitle: record["Job Title"] || '—',
                LeadStatus: record["Lead Status"] || 'not qualified',
                FollowUpStatus: record["Follow Up Status"] || '—',
                Time: record["Time"] || '—',
                Agent: record["agents"] || 'System'
            }));

            setResults(cleanedRecords);

        } catch (error) {
            console.error('Search error:', error);
        } finally {
            clearInterval(quoteInterval);
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSearch();
    };

    const getLeadStatusStyle = (status: string) => {
        const s = (status || '').toLowerCase();
        if (s.includes('replied')) return 'bg-red-100 text-red-700';
        if (s.includes('bounce')) return 'bg-pink-100 text-pink-700';
        if (s.includes('completed')) return 'bg-blue-100 text-blue-700';
        if (s.includes('cold') || s.includes('contact email')) return 'bg-green-100 text-green-700';
        if (s.includes('out of office')) return 'bg-yellow-100 text-yellow-700';
        if (s.includes('meeting') || s.includes('vendor') || s.includes('future')) return 'bg-purple-100 text-purple-700';
        if (s.includes('not qualified') || s.includes('lost') || s.includes('no response') || s.includes('ghost')) return 'bg-[#3d3d3d] text-white';
        if (s.includes('no email') || s.includes('-none-')) return 'bg-slate-100 text-slate-600';
        return 'bg-slate-100 text-slate-600';
    };

    return (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500 min-h-[500px] flex flex-col">

            {/* Centered Search Area */}
            <div className={`transition-all duration-500 flex flex-col items-center justify-center ${hasSearched ? 'py-8' : 'flex-1 py-20'}`}>
                <div className="w-full max-w-3xl space-y-8 text-center">
                    {!hasSearched && (
                        <div className="space-y-4">
                            <h2 className="text-5xl font-black text-slate-900 tracking-tighter">System Wide Search</h2>
                            <p className="text-slate-500 text-lg">Search across all agents and records instantly.</p>
                        </div>
                    )}

                    <div className="relative group">
                        <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative flex items-center bg-white border-2 border-slate-100 rounded-full shadow-xl overflow-hidden hover:border-indigo-500/50 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all duration-300 transform hover:scale-[1.02]">
                            <div className="pl-8 text-indigo-500">
                                <Search size={28} strokeWidth={2.5} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name, email, company, or status..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-full px-6 py-6 text-xl font-bold text-slate-900 placeholder:text-slate-300 bg-transparent border-none outline-none"
                                autoFocus
                            />
                            <button
                                onClick={handleSearch}
                                disabled={loading}
                                className="mr-3 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold uppercase tracking-wider text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Search'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Area */}
            {hasSearched && (
                <div className="w-full max-w-[1600px] mx-auto space-y-6 animate-in slide-in-from-bottom-8 duration-700">

                    {/* Filters Toolbar */}
                    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-4 overflow-x-auto">
                        <div className="shrink-0 text-slate-400 pl-2"><Filter size={20} /></div>

                        {/* Mock Filters */}
                        <select className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/20" value={leadStatusFilter} onChange={(e) => setLeadStatusFilter(e.target.value)}>
                            <option value="all">All Lead Status</option>
                            {[
                                '-None-', 'Not Contacted (cold)', 'Out of Office', 'Replied',
                                '1st contact email', '2nd contact email', '3rd contact email',
                                'No Response', 'Not Qualified Lead', 'Had a Meeting',
                                'Post meeting ghost', 'Sent Vendor Onboarding Forms',
                                'Contact in Future', 'Bounced Email', 'Lost Lead'
                            ].map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>

                        <select className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/20" value={followUpStatusFilter} onChange={(e) => setFollowUpStatusFilter(e.target.value)}>
                            <option value="all">All Follow-up Status</option>
                            {[
                                '-None-', 'No Follow Up Sent', 'Out Of Office',
                                '1 Follow up sent', '2 Follow ups sent'
                            ].map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>

                        <select className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/20" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                        </select>

                        <div className="ml-auto text-xs font-bold text-slate-400 uppercase tracking-widest px-2">
                            {results.length} Results Found
                        </div>
                    </div>

                    {/* Content */}
                    <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm min-h-[300px] relative">
                        {loading && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                                <Loader2 size={48} className="text-indigo-600 animate-spin mb-6" />
                                <p className="text-slate-900 font-black text-xl tracking-tight text-center max-w-md animate-pulse">
                                    "{loadingQuote}"
                                </p>
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">LEAD / RECIPIENT</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">COMPANY / TITLE</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">LEAD STATUS</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">FOLLOW UP STATUS</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">TIME</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">AGENT</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {results.map((row, i) => (
                                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="font-bold text-slate-900 text-sm">{row.Name}</div>
                                                <div className="text-xs text-slate-500">{row.Email}</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="text-sm font-semibold text-slate-700">{row.Company}</div>
                                                <div className="text-xs text-slate-500">{row.JobTitle}</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`px-2 py-1 rounded-md text-xs font-bold ${getLeadStatusStyle(row.LeadStatus)}`}>
                                                    {row.LeadStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-xs font-medium text-slate-500 uppercase tracking-wide">{row.FollowUpStatus}</td>
                                            <td className="px-6 py-5 text-xs font-mono text-slate-400">{row.Time}</td>
                                            <td className="px-6 py-5">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider">
                                                    {row.Agent}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {results.length === 0 && !loading && (
                                        <tr>
                                            <td colSpan={6} className="text-center py-20 text-slate-300 italic">
                                                No results found for "{searchQuery}"
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SystemSearchView;
