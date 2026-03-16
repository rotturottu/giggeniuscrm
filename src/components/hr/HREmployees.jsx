import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserPlus, AlertCircle, Trash2 } from 'lucide-react';

const emptyForm = { first_name: '', last_name: '', email: '', department: '' };

export default function HREmployees() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  // 1. Fetch data safely using the Base44 Master Key
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

  // 2. Setup the Save & Delete tools
  const saveMutation = useMutation({
    mutationFn: (d) => base44.entities.Employee.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] });
      setShowForm(false);
      setForm(emptyForm);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Employee.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });

  const openNew = () => { 
    setForm(emptyForm); 
    setShowForm(true); 
  };

  return (
    <div className="bg-white rounded-xl border p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Employee Directory</h2>
        <Button onClick={openNew} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
          <UserPlus className="w-4 h-4" /> Add Employee
        </Button>
      </div>

      {isError && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> Failed to load employees.
        </div>
      )}

      {isLoading ? (
        <p className="text-center py-10 text-gray-500">Loading employees...</p>
      ) : employees.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
          <p className="text-gray-500">No employees found in the database.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-sm text-gray-500 uppercase">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{emp.first_name} {emp.last_name}</td>
                  <td className="py-3 px-4 text-gray-600">{emp.email}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full text-xs bg-indigo-50 text-indigo-700">
                      {emp.department}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(emp.id)} className="text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* The Missing Modal! */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} placeholder="John" />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} placeholder="Doe" />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="john@company.com" />
            </div>
            <div>
              <Label>Department</Label>
              <Input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder="e.g. Engineering" />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={() => saveMutation.mutate(form)} className="bg-indigo-600 hover:bg-indigo-700">Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}