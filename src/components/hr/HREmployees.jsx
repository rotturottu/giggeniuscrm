import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserPlus, AlertCircle, Trash2, Loader2 } from 'lucide-react';

const emptyForm = { first_name: '', last_name: '', email: '', department: '' };

export default function HREmployees() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  // 1. Fetch data safely
  const { data: employees = [], isLoading, isError } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      try {
        const res = await base44.entities.Employee.list('-created_date', 100);
        return Array.isArray(res) ? res : [];
      } catch (e) {
        console.error("API Fetch Failed:", e);
        return [];
      }
    }
  });

  // 2. Setup the Save tool with validation
  const saveMutation = useMutation({
    mutationFn: (d) => base44.entities.Employee.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] });
      setShowForm(false);
      setForm(emptyForm);
      setError('');
    },
    onError: (err) => {
      setError(err.message || "Failed to save employee. Check backend logs.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Employee.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });

  const handleSave = () => {
    // Basic Validation
    if (!form.first_name || !form.last_name || !form.email || !form.department) {
      setError("All fields are required.");
      return;
    }
    if (!form.email.includes('@')) {
      setError("Please enter a valid email address.");
      return;
    }
    setError('');
    saveMutation.mutate(form);
  };

  const openNew = () => { 
    setForm(emptyForm); 
    setError('');
    setShowForm(true); 
  };

  return (
    <div className="bg-white rounded-xl border p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Employee Directory</h2>
          <p className="text-xs text-gray-500">Manage your internal team members</p>
        </div>
        <Button onClick={openNew} className="bg-indigo-600 hover:bg-indigo-700 gap-2 shadow-md">
          <UserPlus className="w-4 h-4" /> Add Employee
        </Button>
      </div>

      {isError && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> Failed to load employees.
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center py-20 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <p>Syncing directory...</p>
        </div>
      ) : employees.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-xl bg-gray-50/50">
          <p className="text-gray-500 font-medium">No employees found in the database.</p>
          <p className="text-xs text-gray-400">Click the button above to add your first member.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-[11px] text-gray-400 uppercase tracking-widest font-bold">
                <th className="py-4 px-4">Name</th>
                <th className="py-4 px-4">Email Address</th>
                <th className="py-4 px-4">Department</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors group">
                  <td className="py-4 px-4 font-bold text-gray-800">{emp.first_name} {emp.last_name}</td>
                  <td className="py-4 px-4 text-sm text-gray-500 font-medium">{emp.email}</td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 uppercase tracking-wider">
                      {emp.department}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => { if(confirm('Remove this employee?')) deleteMutation.mutate(emp.id); }} 
                      className="text-gray-300 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Registration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-gray-500">First Name</Label>
                <Input value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} placeholder="John" className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-gray-500">Last Name</Label>
                <Input value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} placeholder="Doe" className="h-10" />
              </div>
            </div>
            <div className="space-y-1.5 text-left">
              <Label className="text-xs font-bold uppercase text-gray-500">Email Address</Label>
              <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="john@company.com" className="h-10" />
            </div>
            <div className="space-y-1.5 text-left">
              <Label className="text-xs font-bold uppercase text-gray-500">Department</Label>
              <Input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder="e.g. Engineering" className="h-10" />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs font-semibold">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-6">
              <Button variant="outline" onClick={() => setShowForm(false)} className="h-10">Cancel</Button>
              <Button 
                onClick={handleSave} 
                disabled={saveMutation.isPending} 
                className="bg-indigo-600 hover:bg-indigo-700 h-10 px-6"
              >
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Employee"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}