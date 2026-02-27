import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Ticket, Search, Clock, CheckCircle2, AlertTriangle,
  AlertCircle, ChevronRight, RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import TicketDetail from './TicketDetail';

// PRIORITY_CONFIG for ticket list display
const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-700', dot: 'bg-gray-400' },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700 font-bold animate-pulse', dot: 'bg-red-500' },
};

const STATUS_CONFIG = {
  open: { label: 'Open', color: 'bg-blue-100 text-blue-700', icon: Ticket },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-700', icon: RefreshCw },
  waiting_on_client: { label: 'Waiting on Client', color: 'bg-purple-100 text-purple-700', icon: Clock },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-600', icon: CheckCircle2 },
};

const CATEGORIES = [
  'All Categories', 'Billing & Payments', 'Technical Issue', 'Account Access',
  'Feature Request', 'Flagged User / Fraud', 'CRM Issue', 'Marketplace Issue',
  'Compliance / Legal', 'Other',
];

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-black text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}


export default function TicketsDashboard() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => base44.entities.Ticket.list('-created_date', 200),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Ticket.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tickets'] }),
  });

  const handleUpdate = async (id, data) => {
    await updateMutation.mutateAsync({ id, data });
  };

  const filtered = tickets.filter(t => {
    const matchSearch = !search ||
      t.ticket_number?.toLowerCase().includes(search.toLowerCase()) ||
      t.subject?.toLowerCase().includes(search.toLowerCase()) ||
      t.submitter_name?.toLowerCase().includes(search.toLowerCase()) ||
      t.submitter_email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchPriority = filterPriority === 'all' || t.priority === filterPriority;
    const matchCategory = filterCategory === 'All Categories' || t.category === filterCategory;
    return matchSearch && matchStatus && matchPriority && matchCategory;
  });

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    urgent: tickets.filter(t => t.priority === 'urgent' && t.status !== 'closed' && t.status !== 'resolved').length,
    resolved: tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Tickets" value={stats.total} icon={Ticket} color="bg-blue-100 text-blue-600" />
        <StatCard title="Open" value={stats.open} icon={AlertCircle} color="bg-yellow-100 text-yellow-600" />
        <StatCard title="Urgent" value={stats.urgent} icon={AlertTriangle} color="bg-red-100 text-red-600" />
        <StatCard title="Resolved" value={stats.resolved} icon={CheckCircle2} color="bg-green-100 text-green-600" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tickets..." className="pl-9" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
              <SelectItem key={val} value={val}>{cfg.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            {Object.entries(PRIORITY_CONFIG).map(([val, cfg]) => (
              <SelectItem key={val} value={val}>{cfg.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-52"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Ticket List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-12 text-gray-400">Loading tickets...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No tickets found.</div>
        ) : filtered.map(ticket => {
          const priorityCfg = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.medium;
          const statusCfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
          const StatusIcon = statusCfg.icon;
          return (
            <div
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:border-blue-300 cursor-pointer transition-all duration-200 flex items-center gap-4"
            >
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${priorityCfg.dot}`} />
              <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-mono text-sm font-bold text-blue-600">{ticket.ticket_number}</span>
                <Badge className={`text-xs ${priorityCfg.color}`}>{priorityCfg.label}</Badge>
                <Badge className={`text-xs ${statusCfg.color}`}><StatusIcon className="w-3 h-3 mr-1" />{statusCfg.label}</Badge>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{ticket.category}</span>
                {ticket.priority !== 'urgent' && ticket.description && ticket.description.match(/urgent|terrible|worst|scam|fraud|horrible|unacceptable|furious|angry|disgusting|ridiculous/i) && (
                  <Badge className="text-xs bg-red-100 text-red-700 border border-red-200 gap-1">
                    <AlertTriangle className="w-3 h-3" /> Frustrated
                  </Badge>
                )}
              </div>
                <p className="font-semibold text-gray-900 truncate">{ticket.subject}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span>👤 {ticket.submitter_name}</span>
                  <span>•</span>
                  <span>🖥️ {ticket.platform}</span>
                  {ticket.assigned_to_name && <><span>•</span><span>🎯 {ticket.assigned_to_name}</span></>}
                  {ticket.created_date && <><span>•</span><span>🕐 {format(new Date(ticket.created_date), 'MMM d, yyyy')}</span></>}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </div>
          );
        })}
      </div>

      {selectedTicket && (
        <TicketDetail
          ticket={selectedTicket}
          allTickets={tickets}
          onClose={() => setSelectedTicket(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}