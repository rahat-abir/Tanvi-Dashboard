import React, { useState } from 'react';
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import LinkedInView from './components/LinkedInView';
import SystemSearchView from './components/SystemSearchView';
import { MOCK_STATS } from './constants';
import { EmailStats } from './types';

interface Agent {
  name: string;
  payload: string;
}

const AGENTS: Agent[] = [
  { name: 'Tanvi', payload: 'part 1 (tanvi)' },
  { name: 'Marcus', payload: 'part 3 (marcus)' },
  { name: 'Sarah', payload: 'part 4 (sarah)' },
  { name: 'Tom', payload: 'part 5 (tom)' },
  { name: 'Emma', payload: 'part 6 (emma)' },
  { name: 'Leah', payload: 'part 7 (leah)' },
];

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

const WEBHOOK_URL = 'https://layerland.app.n8n.cloud/webhook/8c3e2219-a767-445a-ba53-f1003176c758';
const LINKEDIN_WEBHOOK_URL = 'https://layerland.app.n8n.cloud/webhook/3712c2e6-46cd-4348-a126-78017955b1cc';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'linkedin' | 'system-search'>('dashboard');
  const [selectedAgentName, setSelectedAgentName] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isLinkedInLoading, setIsLinkedInLoading] = useState(false);

  const [dashboardStats, setDashboardStats] = useState<EmailStats>(MOCK_STATS);
  const [activityData, setActivityData] = useState<ActivityRecord[]>([]);
  const [linkedInData, setLinkedInData] = useState<any[]>([]);

  const [agentSummary, setAgentSummary] = useState<{ sent: number; replies: number } | null>(null);

  const fetchLinkedInData = async () => {
    setIsLinkedInLoading(true);
    try {
      const response = await fetch(LINKEDIN_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'read' }),
      });

      if (!response.ok) throw new Error('LinkedIn webhook failed');

      const rawData = await response.json();
      console.log('🔗 LinkedIn Raw Data:', rawData);

      let records: any[] = [];

      // Robust array extraction same as dashboard
      if (Array.isArray(rawData)) {
        if (rawData.every((item: any) => item && item.json)) {
          records = rawData.map((item: any) => item.json);
        } else {
          records = rawData;
        }
      } else if (rawData && typeof rawData === 'object') {
        // Check for wrapped inner arrays often returned by n8n
        const possibleArrayKeys = ['data', 'items', 'records', 'rows', 'json', 'body', 'results', 'values'];
        let found = false;

        for (const key of possibleArrayKeys) {
          const possibleArray = (rawData as any)[key];
          if (Array.isArray(possibleArray)) {
            records = possibleArray;
            found = true;
            break;
          }
        }

        if (!found) {
          records = [rawData];
        }
      } else {
        records = [rawData];
      }

      const normalizedData = records.map((item: any) => {
        const source = item.json || item;
        const findVal = (key: string) => {
          const keys = Object.keys(source);
          const foundKey = keys.find(k => k.trim().toLowerCase() === key.trim().toLowerCase());
          return foundKey ? source[foundKey] : '—';
        };

        return {
          "Name": findVal("Name"),
          "Job Title": findVal("Job Title"),
          "Company": findVal("Company"),
          "Email": findVal("Email"),
          "LinkedIn": findVal("LinkedIn"),
          "email to send": findVal("email to send"),
          "done?": findVal("done?")
        };
      });

      setLinkedInData(normalizedData);

    } catch (error) {
      console.error("Error fetching linkedin data:", error);
    } finally {
      setIsLinkedInLoading(false);
    }
  };

  const handleViewChange = async (view: 'dashboard' | 'linkedin' | 'system-search') => {
    setCurrentView(view);


    if (view === 'linkedin' && linkedInData.length === 0) {
      await fetchLinkedInData();
    }
  };

  const fetchAgentData = async (agent: Agent) => {
    setIsLoading(true);
    setActivityData([]);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tabName: agent.payload, action: 'read' }),
      });

      if (!response.ok) throw new Error('Webhook failed');

      const rawData = await response.json();
      console.log('🔍 Raw webhook response:', rawData);

      // Rule: Treat response as array and load every element
      let records: any[] = [];

      if (Array.isArray(rawData)) {
        if (rawData.length === 1 && Array.isArray(rawData[0])) {
          records = rawData[0];
        } else if (rawData.length === 1 && rawData[0].json && Array.isArray(rawData[0].json)) {
          records = rawData[0].json;
        } else if (rawData.length === 1 && rawData[0].body && Array.isArray(rawData[0].body)) {
          records = rawData[0].body;
        } else if (rawData.every((item: any) => item && item.json)) {
          records = rawData.map((item: any) => item.json);
        } else {
          records = rawData;
        }
      } else if (rawData && typeof rawData === 'object') {
        const possibleArrayKeys = ['data', 'items', 'records', 'rows', 'json', 'body', 'results', 'values'];
        let found = false;

        for (const key of possibleArrayKeys) {
          const possibleArray = (rawData as any)[key];
          if (Array.isArray(possibleArray)) {
            records = possibleArray;
            found = true;
            break;
          }
        }

        if (!found) {
          records = [rawData];
        }
      } else {
        records = [rawData];
      }

      const normalizedActivities: ActivityRecord[] = records.map((item: any) => {
        const source = item.json || item;

        const findVal = (key: string) => {
          const keys = Object.keys(source);
          const foundKey = keys.find(k => k.trim().toLowerCase() === key.trim().toLowerCase());
          const val = foundKey ? source[foundKey] : '—';
          return (val === null || val === undefined) ? '—' : String(val);
        };

        return {
          "Name": findVal("Name"),
          "Email": findVal("Email"),
          "Company": findVal("Company"),
          "Job Title": findVal("Job Title"),
          "Lead Status": findVal("Lead Status"),
          "Follow Up Status": findVal("Follow Up Status"),
          "Time": findVal("Time"),
          "sent to tanvi": findVal("sent to tanvi")
        };
      });

      setActivityData(normalizedActivities);

      // Update Dashboard Overview Stats
      const total = normalizedActivities.length;
      const getLeadStatus = (a: ActivityRecord) => (a["Lead Status"] || "").toLowerCase().trim();
      const getFollowUpStatus = (a: ActivityRecord) => (a["Follow Up Status"] || "").toLowerCase().trim();

      const replied = normalizedActivities.filter(a => getLeadStatus(a).includes('replied')).length;

      const completed = normalizedActivities.filter(a => {
        const leadStatus = getLeadStatus(a);
        const followUpStatus = getFollowUpStatus(a);
        return (leadStatus.includes('cold') || leadStatus.includes('contact email')) && followUpStatus.includes('2 follow');
      }).length;

      const cold = normalizedActivities.filter(a => {
        const leadStatus = getLeadStatus(a);
        const followUpStatus = getFollowUpStatus(a);
        return (leadStatus.includes('cold') || leadStatus.includes('contact email')) && !followUpStatus.includes('2 follow');
      }).length;

      const bounced = normalizedActivities.filter(a => getLeadStatus(a).includes('bounce')).length;

      const emailsToSend = normalizedActivities.filter(a => {
        const leadStatus = getLeadStatus(a);
        const followUpStatus = getFollowUpStatus(a);
        return (leadStatus.includes('no email') || leadStatus.includes('-none-')) && (followUpStatus.includes('no follow up') || followUpStatus.includes('-none-'));
      }).length;


      const linkedInSent = normalizedActivities.filter(a => String(a["sent to tanvi"]).toLowerCase().trim() === 'sent').length;

      setDashboardStats({ total, replied, completed, cold, bounced, emailsToSend, linkedInSent });
      setAgentSummary({ sent: total, replies: replied });

    } catch (error) {
      console.error('Error fetching agent data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAgentClick = async (agent: Agent) => {
    setSelectedAgentName(agent.name);
    await fetchAgentData(agent);
  };

  const handleStatusUpdate = async (email: string, field: 'Lead Status' | 'Follow Up Status', value: string) => {
    if (!selectedAgentName) return;

    // Find the agent payload from the name
    const agent = AGENTS.find(a => a.name === selectedAgentName);
    if (!agent) return;

    // Optimistic update
    setActivityData(prev => prev.map(record => {
      if (record.Email === email) {
        return { ...record, [field]: value };
      }
      return record;
    }));

    try {
      console.log(`Updating ${field} for ${email} to ${value}`);
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tabName: agent.payload,
          action: 'write',
          email,
          field,
          value
        }),
      });

      if (!response.ok) {
        throw new Error('Status update webhook failed');
      }

      const responseText = await response.text();
      console.log('Status update successful, Response:', responseText);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      <Navbar currentView={currentView} onViewChange={handleViewChange} />

      <main className="max-w-[1600px] mx-auto overflow-x-hidden pt-12">
        <div className="p-4 lg:p-8">
          {currentView === 'dashboard' ? (
            <DashboardView
              stats={dashboardStats}
              agents={AGENTS}
              selectedAgentName={selectedAgentName}
              activityData={activityData}
              isLoading={isLoading}
              agentSummary={agentSummary}
              onAgentClick={handleAgentClick}
              onStatusUpdate={handleStatusUpdate}
            />
          ) : currentView === 'system-search' ? (
            <SystemSearchView />
          ) : (
            <LinkedInView
              activityData={linkedInData}
              isLoading={isLinkedInLoading}
              onRefresh={fetchLinkedInData}
              onUpdateStatus={async (email, currentIsDone) => {
                try {
                  const action = currentIsDone ? 'make undone' : 'make done';
                  console.log(`Update requested for: ${email}, Action: ${action}`);

                  const response = await fetch(LINKEDIN_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action, email }),
                  });

                  if (!response.ok) throw new Error('Update webhook failed');

                  console.log('Update success, refreshing data...');
                  await fetchLinkedInData();

                } catch (error) {
                  console.error('Error updating status:', error);
                }
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
