import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Folder, Calendar, User, DollarSign, FileText, UploadCloud, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

const currencies = ['PHP', 'USD', 'EUR', 'GBP', 'CAD', 'AUD'];

export default function ProjectsList() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    assigned_person: '',
    start_date: '',
    end_date: '',
    description: '',
    budget: '',
    currency: 'PHP',
    status: 'Planned'
  });
  const [fileName, setFileName] = useState('');

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Project.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      setOpen(false);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Project.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] })
  });

  const resetForm = () => {
    setFormData({ name: '', assigned_person: '', start_date: '', end_date: '', description: '', budget: '', currency: 'PHP', status: 'Planned' });
    setFileName('');
  };

  const filteredProjects = projects.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="border-none shadow-sm bg-white/50 backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
        <div>
          <CardTitle className="text-xl font-bold">Project Management</CardTitle>
          <div className="relative mt-2 w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search projects..." 
              className="pl-8 h-9" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" /> New Project
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-20">
            <Folder className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500">No projects found. Create your first one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{project.name}</h3>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(project.id)}>
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                    </Button>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2"><User className="w-3 h-3"/> {project.assigned_person || 'Unassigned'}</div>
                    <div className="flex items-center gap-2"><Calendar className="w-3 h-3"/> {project.start_date} - {project.end_date}</div>
                    <div className="flex items-center gap-2"><DollarSign className="w-3 h-3"/> {project.currency} {project.budget}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Folder className="text-indigo-600" /> Project Initiation
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-semibold">Project Title *</Label>
                <Input 
                  placeholder="e.g. Website Redesign" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="font-semibold">Assigned Person</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    className="pl-10" 
                    placeholder="Project Lead Name" 
                    value={formData.assigned_person}
                    onChange={e => setFormData({...formData, assigned_person: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">Start Date</Label>
                  <Input type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">Completion Date</Label>
                  <Input type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-semibold">Budget Details</Label>
                <div className="flex gap-2">
                  <Select value={formData.currency} onValueChange={v => setFormData({...formData, currency: v})}>
                    <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                    <SelectContent>{currencies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    value={formData.budget}
                    onChange={e => setFormData({...formData, budget: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">Project Details</Label>
                <Textarea 
                  className="min-h-[100px]" 
                  placeholder="Objectives and scope..." 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">Signed Contract Copy</Label>
                <div className="border-2 border-dashed rounded-lg p-4 bg-gray-50 text-center hover:bg-gray-100 transition-colors">
                  <input 
                    type="file" 
                    id="file-upload" 
                    className="hidden" 
                    onChange={(e) => setFileName(e.target.files[0]?.name)} 
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <UploadCloud className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                    <span className="text-sm text-gray-600 block">{fileName || 'Upload actual copy (PDF/IMG)'}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700 px-8"
              onClick={() => createMutation.mutate(formData)}
              disabled={!formData.name}
            >
              Initialize Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}