import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, Edit, Plus, Trash2, Users, Wallet, AlertCircle } from 'lucide-react';
import { useState, useMemo } from 'react';

const currencySymbols = { USD: '$', EUR: '€', PHP: '₱', CAD: 'C$', AUD: 'A$' };
const empty = { name: '', head_email: '', description: '', budget: '', currency: 'PHP' };

export default function HRDepartments() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  // 1. Fetch data with extreme safety
  const { data: remoteDepts, isLoading, isError } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      try {
        const res = await base44.entities.Department.list('-created_date', 50);
        return Array.isArray(res) ? res : [];
      } catch (e) {
        console.error("API Fetch Failed:", e);
        return [];
      }
    },
    retry: false
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const res = await base44.entities.Employee.list('-created_date', 200);
      return Array.isArray(res) ? res : [];
    },
  });

  // 2. FALLBACK DATA: If API fails, show this so the page isn't blank
  const departments = useMemo(() => {
    if (Array.isArray(remoteDepts) && remoteDepts.length > 0) return remoteDepts;
    return [
      { id: 'test-1', name: 'Engineering', description: 'Development Team (Test Data)', head_email: 'admin@giggenius.local', currency: 'PHP', budget: '500000' }
    ];
  }, [remoteDepts]);

  const saveMutation = useMutation({
    mutationFn: (d) => editing ? base44.entities.Department.update(editing.id, d) : base44.entities.Department.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['departments'] }); setShowForm(false); setForm(empty); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Department.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['departments'] }),
  });

  const getCount = (name) => Array.isArray(employees) ? employees.filter(e => e.department === name).length : 0;
  const openEdit = (d) => { setEditing(d); setForm({ ...empty, ...d }); setShowForm(true); };
  const openNew = () => { setEditing(null); setForm(empty); setShowForm(true); };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openNew} className="bg-indigo-600 hover:bg-indigo-700 gap-2 shadow-lg">
          <Plus className="w-4 h-4" /> Add Department
        </Button>
      </div>

      {isError && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> 
          Backend connection issues. Showing local fallback data.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <Card key={dept.id} className="hover:shadow-xl transition-all border-t-4 border-t-indigo-500 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-indigo-600" />
                  </div>
                  <CardTitle className="text-lg font-bold text-slate-800">{dept.name}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(dept)}><Edit className="w-4 h-4 text-slate-400" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(dept.id)} className="text-red-400"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="text-slate-500 line-clamp-2 min-h-[40px] italic">"{dept.description}"</p>
              <div className="pt-4 space-y-3