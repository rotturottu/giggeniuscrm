import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, User, Mail, Building, Phone, Tag, Edit, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const TYPE_COLORS = {
  lead: 'bg-blue-100 text-blue-700',
  customer: 'bg-green-100 text-green-700',
  partner: 'bg-purple-100 text-purple-700',
  spam_blocked: 'bg-red-100 text-red-700',
};

export default function ContactList({ onEdit, onView, smartListId }) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list('-created_date', 500),
  });

  const { data: smartLists = [] } = useQuery({
    queryKey: ['smart-lists'],
    queryFn: () => base44.entities.SmartList.list('-created_date'),
    enabled: !!smartListId,
  });

  const selectedList = smartLists.find(l => l.id === smartListId);

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Contact.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contact deleted');
    },
  });

  const filtered = contacts.filter(c => {
    const matchType = typeFilter === 'all' || c.contact_type === typeFilter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      c.email?.toLowerCase().includes(q) ||
      c.first_name?.toLowerCase().includes(q) ||
      c.last_name?.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q) ||
      c.business_name?.toLowerCase().includes(q);

    // Smart list filtering
    let matchList = true;
    if (smartListId && selectedList) {
      if (selectedList.filter_type === 'manual') {
        matchList = (selectedList.contact_ids || []).includes(c.id);
      } else if (selectedList.filter_type === 'automatic') {
        matchList = (selectedList.rules || []).every(rule => {
          const val = (c[rule.field] || '').toString().toLowerCase();
          const rv = (rule.value || '').toLowerCase();
          if (rule.operator === 'equals') return val === rv;
          if (rule.operator === 'not_equals') return val !== rv;
          if (rule.operator === 'contains') return val.includes(rv);
          if (rule.operator === 'not_contains') return !val.includes(rv);
          return true;
        });
      }
    }

    return matchType && matchSearch && matchList;
  });

  if (isLoading) return <div className="text-center py-12 text-gray-400">Loading contacts...</div>;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <Input placeholder="Search name, email, company..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="lead">Lead</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="partner">Partner</SelectItem>
            <SelectItem value="spam_blocked">Spam/Blocked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Count */}
      <p className="text-sm text-gray-500">{filtered.length} contact{filtered.length !== 1 ? 's' : ''}</p>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Company</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden xl:table-cell">Tags</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {c.logo_url
                        ? <img src={c.logo_url} className="w-7 h-7 rounded-full object-cover" alt="" />
                        : <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {(c.first_name || c.email)[0].toUpperCase()}
                          </div>
                      }
                      <span className="font-medium truncate max-w-[120px]">
                        {[c.first_name, c.last_name].filter(Boolean).join(' ') || c.email.split('@')[0]}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 truncate max-w-[160px]">{c.email}</td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                    {c.phone ? <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span> : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{c.business_name || c.company || <span className="text-gray-300">—</span>}</td>
                  <td className="px-4 py-3">
                    <Badge className={`text-xs ${TYPE_COLORS[c.contact_type] || 'bg-gray-100 text-gray-600'}`}>
                      {(c.contact_type || 'lead').replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {(c.tags || []).slice(0, 2).map((t, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{t}</Badge>
                      ))}
                      {(c.tags || []).length > 2 && <span className="text-xs text-gray-400">+{c.tags.length - 2}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onView(c)}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onEdit(c)}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400 hover:text-red-600" onClick={() => deleteMutation.mutate(c.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <User className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>No contacts found</p>
          </div>
        )}
      </div>
    </div>
  );
}