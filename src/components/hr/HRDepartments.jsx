import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, Edit, Plus, Trash2, Users, Wallet, AlertCircle } from 'lucide-react';
import { useState } from 'react';

const currencySymbols = {
  USD: '$',
  EUR: '€',
  PHP: '₱',
  CAD: 'C$',
  AUD: 'A$'
};

const empty = { name: '', head_email: '', description: '', budget: '', currency: 'PHP' };

export default function HRDepartments() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  // Added isLoading and isError for better stability
  const { data: departments = [], isLoading, isError } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const resp = await base44.entities.Department.list('-created_date', 50);
      return Array.isArray(resp) ? resp : [];
    },
    retry: 1
  });
  
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const resp = await base44.entities.Employee.list('-created_date', 200);
      return Array.isArray(resp) ? resp : [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: (d) => editing ? base44.entities.Department.update(editing.id, d) : base44.entities.Department.create(d),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['departments'] }); 
      setShowForm(false); 
      setEditing(null); 
      setForm(empty); 
      setError(''); 
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Department.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['departments'] }),
  });

  const getCount = (name) => {
    if (!Array.isArray(employees)) return 0;
    return employees.filter(e => e.department === name).length;
  };

  const openEdit = (d) => { setEditing(d); setForm({ ...empty, ...d }); setError(''); setShowForm(true); };
  const openNew = () => { setEditing(null); setForm(empty); setError(''); setShowForm(true); };

  const handleNumberChange = (key, value) => {
    setForm(p => ({ ...p, [key]: value }));
    if (/[a-zA-Z]/.test(value)) {
      setError('Invalid Input! Numbers only please.');
    } else {
      setError('');
    }
  };

  const handleEmailChange = (key, value) => {
    setForm(p => ({ ...p, [key]: value }));
    if (value && !value.includes('@')) {
      setError('Invalid Email format.');
    } else {
      setError('');
    }
  };

  const handleSave = () => {
    const requiredFields = ['name', 'head_email', 'description', 'budget', 'currency'];
    if (requiredFields.some(field => !form[field])) {
      setError('Please fill out all fields.');
      return;
    }
    saveMutation.mutate(form);
  };

  // Prevent Blank Page on Error
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-red-50 border border-red-200 rounded-xl text-red-600">
        <AlertCircle className="w-12 h-12 mb-4" />
        <h3 className="text-lg font-bold">API Connection Failed</h3>
        <p className="text-sm">Check if your backend is running at 72.61.114.146:5000</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openNew} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
          <Plus className="w-4 h-4" />Add Department
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-