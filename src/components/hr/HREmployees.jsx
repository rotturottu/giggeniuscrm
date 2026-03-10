import { base44 } from '@/api/base44Client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Briefcase, Building2, Edit, Mail, Phone, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

const statusColors = {
  active: 'bg-green-100 text-green-700',
  on_leave: 'bg-yellow-100 text-yellow-700',
  terminated: 'bg-red-100 text-red-700',
};

// Map to display the designated currency symbol inside the input
const currencySymbols = {
  USD: '$',
  EUR: '€',
  PHP: '₱',
  CAD: 'C$',
  AUD: 'A$'
};

// Line directory for phone numbers
const phoneCodes = [
  { code: '+63', label: '🇵🇭 (+63)' },
  { code: '+1', label: '🇺🇸 (+1)' },
  { code: '+44', label: '🇬🇧 (+44)' },
  { code: '+61', label: '🇦🇺 (+61)' }
];

// Map to display the designated currency symbol inside the input
const currencySymbols = {
  USD: '$',
  EUR: '€',
  PHP: '₱',
  CAD: 'C$',
  AUD: 'A$'
};

// Line directory for phone numbers
const phoneCodes = [
  { code: '+63', label: '🇵🇭 (+63)' },
  { code: '+1', label: '🇺🇸 (+1)' },
  { code: '+44', label: '🇬🇧 (+44)' },
  { code: '+61', label: '🇦🇺 (+61)' }
];

const emptyForm = {
  first_name: '', last_name: '', email: '', phone: '', country_code: '+63',
  first_name: '', last_name: '', email: '', phone: '', country_code: '+63',
  department: '', job_title: '', employment_type: 'full_time',
  status: 'active', start_date: '', salary: '', currency: 'PHP', hourly_rate: '',
  status: 'active', start_date: '', salary: '', currency: 'PHP', hourly_rate: '',
  manager_email: '', notes: '',
};

export default function HREmployees() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [error, setError] = useState('');

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.Employee.list('-created_date', 100),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editing
      ? base44.entities.Employee.update(editing.id, data)
      : base44.entities.Employee.create(data),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['employees'] }); 
      setShowForm(false); 
      setEditing(null); 
      setForm(emptyForm); 
      setError('');
    },
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['employees'] }); 
      setShowForm(false); 
      setEditing(null); 
      setForm(emptyForm); 
      setError('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Employee.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });

  const departments = [...new Set(employees.map(e => e.department).filter(Boolean))];

  const filtered = employees.filter(e => {
    const matchSearch = `${e.first_name} ${e.last_name} ${e.email} ${e.job_title}`.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'all' || e.department === deptFilter;
    return matchSearch && matchDept;
  });

  const openEdit = (emp) => { 
    let code = '+63';
    let phoneNum = emp.phone || '';
    
    // Parse the saved phone string back into country code and local number
    for (const pc of phoneCodes) {
      if (phoneNum.startsWith(pc.code + ' ')) {
        code = pc.code;
        phoneNum = phoneNum.substring(pc.code.length + 1);
        break;
      }
    }

    setEditing(emp); 
    setForm({ ...emptyForm, ...emp, currency: emp.currency || 'PHP', country_code: code, phone: phoneNum }); 
    setError(''); 
    setShowForm(true); 
  };
  
  const openNew = () => { setEditing(null); setForm(emptyForm); setError(''); setShowForm(true); };

  // Real-time validation for number-only fields
  const handleNumberChange = (key, value) => {
    setForm(p => ({ ...p, [key]: value }));
    if (/[a-zA-Z]/.test(value)) {
      setError('Invalid Input! Alphabets are not allowed in number-only sections.');
    } else {
      setError('');
    }
  };

  // Real-time validation for emails
  const handleEmailChange = (key, value) => {
    setForm(p => ({ ...p, [key]: value }));
    if (value && !value.includes('@')) {
      setError('Invalid Input! Email fields must contain an "@" symbol.');
    } else {
      setError('');
    }
  };

  const handleSave = () => {
    // 1. Completely filled out check
    const requiredFields = ['first_name', 'last_name', 'email', 'phone', 'department', 'job_title', 'manager_email', 'start_date', 'salary', 'hourly_rate'];
    const hasEmptyFields = requiredFields.some(field => !form[field] || form[field].toString().trim() === '');
    
    if (hasEmptyFields) {
      setError('Invalid Input! Please ensure the form is completely filled out.');
      return;
    }

    // 2. "@" Check
    if (!form.email.includes('@') || !form.manager_email.includes('@')) {
      setError('Invalid Input! Email fields must contain an "@" symbol.');
      return;
    }

    // 3. Alphabet Check in Number Sections
    if (/[a-zA-Z]/.test(form.salary) || /[a-zA-Z]/.test(form.hourly_rate) || /[a-zA-Z]/.test(form.phone)) {
      setError('Invalid Input! Alphabets are not allowed in number-only sections.');
      return;
    }

    setError('');
    
    // Combine country code and phone number before saving to API
    const payloadToSave = { 
      ...form, 
      phone: `${form.country_code} ${form.phone}` 
    };
    
    saveMutation.mutate(payloadToSave);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <Input className="pl-9 w-56" placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="w-44"><SelectValue placeholder="All Departments" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openNew} className="bg-indigo-600 hover:bg-indigo-700 gap-2"><Plus className="w-4 h-4" />Add Employee</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(emp => (
          <Card key={emp.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold">
                      {emp.first_name?.[0]}{emp.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">{emp.first_name} {emp.last_name}</p>
                    <p className="text-sm text-gray-500">{emp.job_title}</p>
                  </div>
                </div>
                <Badge className={statusColors[emp.status] || 'bg-gray-100 text-gray-700'}>{emp.status?.replace('_', ' ')}</Badge>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" />{emp.email}</div>
                {emp.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" />{emp.phone}</div>}
                <div className="flex items-center gap-2"><Building2 className="w-3.5 h-3.5" />{emp.department}</div>
                <div className="flex items-center gap-2"><Briefcase className="w-3.5 h-3.5" />{emp.employment_type?.replace('_', ' ')}</div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t">
                <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => openEdit(emp)}><Edit className="w-3.5 h-3.5" />Edit</Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 gap-1" onClick={() => deleteMutation.mutate(emp.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-12 text-gray-400">No employees found.</div>
        )}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit Employee' : 'Add Employee'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            
            {/* Map over fields to dynamically render inputs based on requirements */}
            {[['first_name', 'First Name *'], ['last_name', 'Last Name *'], ['email', 'Email *'], ['phone', 'Phone *'], ['department', 'Department *'], ['job_title', 'Job Title *'], ['manager_email', 'Manager Email *'], ['start_date', 'Start Date *'], ['salary', 'Annual Salary *'], ['hourly_rate', 'Hourly Rate *']].map(([key, label]) => (
            
            {/* Map over fields to dynamically render inputs based on requirements */}
            {[['first_name', 'First Name *'], ['last_name', 'Last Name *'], ['email', 'Email *'], ['phone', 'Phone *'], ['department', 'Department *'], ['job_title', 'Job Title *'], ['manager_email', 'Manager Email *'], ['start_date', 'Start Date *'], ['salary', 'Annual Salary *'], ['hourly_rate', 'Hourly Rate *']].map(([key, label]) => (
              <div key={key} className="space-y-1">
                <Label className={label.includes('*') ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>{label.replace(' *', '')}</Label>
                
                {key === 'salary' || key === 'hourly_rate' ? (
                  // SALARY & HOURLY RATE: Dropdown + Currency Input Wrapper
                  <div className="flex gap-2">
                    <Select value={form.currency} onValueChange={v => setForm(p => ({ ...p, currency: v }))}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="PHP">PHP</SelectItem>
                        <SelectItem value="CAD">CAD</SelectItem>
                        <SelectItem value="AUD">AUD</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="relative flex-1">
                      {/* Designated Currency Symbol Placed inside */}
                      <span className="absolute left-3 top-2 text-gray-500 font-medium">
                        {currencySymbols[form.currency]}
                      </span>
                      <Input 
                        type="text" 
                        className="pl-8"
                        value={form[key] || ''} 
                        onChange={e => handleNumberChange(key, e.target.value)} 
                      />
                    </div>
                  </div>
                ) : key === 'phone' ? (
                  // PHONE: Country Code Dropdown + Phone Input
                  <div className="flex gap-2">
                    <Select value={form.country_code} onValueChange={v => setForm(p => ({ ...p, country_code: v }))}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {phoneCodes.map(pc => (
                          <SelectItem key={pc.code} value={pc.code}>{pc.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input 
                      type="text" 
                      className="flex-1"
                      value={form[key] || ''} 
                      onChange={e => handleNumberChange(key, e.target.value)} 
                    />
                  </div>
                ) : key === 'email' || key === 'manager_email' ? (
                  // EMAILS: Checked for '@'
                  <Input 
                    type="email"
                    value={form[key] || ''} 
                    onChange={e => handleEmailChange(key, e.target.value)} 
                  />
                ) : (
                  // DEFAULT TEXT & DATE INPUTS
                  <Input 
                    type={key === 'start_date' ? 'date' : 'text'}
                    value={form[key] || ''} 
                    onChange={e => {
                      setForm(p => ({ ...p, [key]: e.target.value }));
                      if (error) setError('');
                    }} 
                  />
                )}
                <Label className={label.includes('*') ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>{label.replace(' *', '')}</Label>
                
                {key === 'salary' || key === 'hourly_rate' ? (
                  // SALARY & HOURLY RATE: Dropdown + Currency Input Wrapper
                  <div className="flex gap-2">
                    <Select value={form.currency} onValueChange={v => setForm(p => ({ ...p, currency: v }))}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="PHP">PHP</SelectItem>
                        <SelectItem value="CAD">CAD</SelectItem>
                        <SelectItem value="AUD">AUD</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="relative flex-1">
                      {/* Designated Currency Symbol Placed inside */}
                      <span className="absolute left-3 top-2 text-gray-500 font-medium">
                        {currencySymbols[form.currency]}
                      </span>
                      <Input 
                        type="text" 
                        className="pl-8"
                        value={form[key] || ''} 
                        onChange={e => handleNumberChange(key, e.target.value)} 
                      />
                    </div>
                  </div>
                ) : key === 'phone' ? (
                  // PHONE: Country Code Dropdown + Phone Input
                  <div className="flex gap-2">
                    <Select value={form.country_code} onValueChange={v => setForm(p => ({ ...p, country_code: v }))}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {phoneCodes.map(pc => (
                          <SelectItem key={pc.code} value={pc.code}>{pc.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input 
                      type="text" 
                      className="flex-1"
                      value={form[key] || ''} 
                      onChange={e => handleNumberChange(key, e.target.value)} 
                    />
                  </div>
                ) : key === 'email' || key === 'manager_email' ? (
                  // EMAILS: Checked for '@'
                  <Input 
                    type="email"
                    value={form[key] || ''} 
                    onChange={e => handleEmailChange(key, e.target.value)} 
                  />
                ) : (
                  // DEFAULT TEXT & DATE INPUTS
                  <Input 
                    type={key === 'start_date' ? 'date' : 'text'}
                    value={form[key] || ''} 
                    onChange={e => {
                      setForm(p => ({ ...p, [key]: e.target.value }));
                      if (error) setError('');
                    }} 
                  />
                )}
              </div>
            ))}
            
            
            <div className="space-y-1">
              <Label>Employment Type</Label>
              <Select value={form.employment_type} onValueChange={v => setForm(p => ({ ...p, employment_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">Full Time</SelectItem>
                  <SelectItem value="part_time">Part Time</SelectItem>
                  <SelectItem value="contractor">Contractor</SelectItem>
                  <SelectItem value="intern">Intern</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Dynamic Error Message Banner */}
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-semibold flex items-center justify-between animate-in fade-in duration-300">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
            <Button variant="outline" onClick={() => { setShowForm(false); setError(''); }}>Cancel</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700">
          
          {/* Dynamic Error Message Banner */}
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-semibold flex items-center justify-between animate-in fade-in duration-300">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
            <Button variant="outline" onClick={() => { setShowForm(false); setError(''); }}>Cancel</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700">
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}