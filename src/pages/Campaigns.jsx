import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Megaphone, Plus, BarChart3, Users, Target, X } from 'lucide-react'; // Added 'X' icon for closing

export default function Campaigns() {
  // 1. ADDED: State to control whether the popup is open or closed
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: remoteData, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      try {
        const res = await base44.entities.Campaign.list('-created_date', 50);
        return Array.isArray(res) ? res : [];
      } catch (error) {
        console.error("Campaign API Error:", error);
        return [];
      }
    },
    retry: false
  });

  const campaigns = Array.isArray(remoteData) && remoteData.length > 0 
    ? remoteData 
    : [
        { id: 't1', name: 'Summer Promotion', status: 'Active', leads: 45, conversion: '12%' },
        { id: 't2', name: 'Product Launch', status: 'Draft', leads: 0, conversion: '0%' }
      ];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Campaigns</h1>
          <p className="text-slate-500">Track and manage your marketing performance</p>
        </div>
        {/* 2. ADDED: onClick event to open the popup */}
        <Button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-indigo-600 hover:bg-indigo-700 shadow-md gap-2"
        >
          <Plus className="w-4 h-4" /> New Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 text-center text-slate-400">Syncing with server...</div>
        ) : (
          campaigns.map((camp) => (
            <Card key={camp.id} className="hover:shadow-xl transition-all border-none bg-white ring-1 ring-slate-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Megaphone className="h-5 w-5 text-indigo-600" />
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                  camp.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {camp.status}
                </span>
              </CardHeader>
              <CardContent className="pt-4">
                <CardTitle className="text-xl mb-4">{camp.name}</CardTitle>
                <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-4">
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Leads</p>
                    <p className="text-lg font-bold text-slate-800">{camp.leads}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Conversion</p>
                    <p className="text-lg font-bold text-indigo-600">{camp.conversion}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 3. ADDED: The Popup Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Create New Campaign</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Campaign Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Summer Blowout 2026" 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Status</label>
                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                  <option value="Draft">Draft</option>
                  <option value="Active">Active</option>
                </select>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <Button onClick={() => setIsModalOpen(false)} className="bg-white text-slate-700 border border-slate-200 hover:bg-slate-100">
                Cancel
              </Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                Save Campaign
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}