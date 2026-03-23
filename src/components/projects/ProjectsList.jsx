import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Calendar, User, FolderOpen, ChevronDown, Trash2, DollarSign } from 'lucide-react';
import NewProjectModal from './NewProjectModal';

const currencySymbols = { USD: '$', EUR: '€', PHP: '₱' };

export default function ProjectsList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const qc = useQueryClient();

  // Fetch only active projects for the main list
  const { data: projects = [] } = useQuery({
    queryKey: ['projects', 'active'],
    queryFn: () => base44.entities.Project.filter({ status: 'active' }),
  });

  // Fetch drafts separately for the dropdown
  const { data: drafts = [] } = useQuery({
    queryKey: ['projects', 'drafts'],
    queryFn: () => base44.entities.Project.filter({ status: 'draft' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Project.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] })
  });

  const openEdit = (p) => { 
    setEditingProject(p); 
    setIsModalOpen(true); 
  };

  const openNew = () => { 
    setEditingProject(null); 
    setIsModalOpen(true); 
  };

  const filteredProjects = projects.filter(p => 
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm bg-white/80 backdrop-blur">
        <CardHeader className="border-b pb-6">
          <div className="flex justify-between items-center mb-4">
            <CardTitle className="text-2xl font-bold text-gray-800">Project Management</CardTitle>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 border-gray-200 bg-white text-gray-600">
                    <FolderOpen className="w-4 h-4 text-amber-500" /> 
                    Drafts ({drafts.length}) 
                    <ChevronDown className="w-3 h-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  {drafts.length === 0 ? (
                    <p className="p-4 text-center text-xs text-gray-400">No project drafts</p>
                  ) : (
                    drafts.map(d => (
                      <div key={d.id} className="flex items-center hover:bg-gray-50 px-2 border-b last:border-0">
                        <DropdownMenuItem className="flex-1 cursor-pointer py-2" onClick={() => openEdit(d)}>
                          <span className="text-sm font-bold truncate">{d.name || '(Untitled Draft)'}</span>
                        </DropdownMenuItem>
                        <Trash2 
                          className="w-3 h-3 text-gray-300 hover:text-red-500 cursor-pointer" 
                          onClick={() => deleteMutation.mutate(d.id)} 
                        />
                      </div>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button 
                className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-md" 
                onClick={openNew}
              >
                <Plus className="w-4 h-4 mr-2" /> New Project
              </Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search projects..." 
              className="pl-10 h-11 border-gray-200" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </CardHeader>
        
        <CardContent className="pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(p => (
              <Card 
                key={p.id} 
                className="hover:shadow-lg transition-all border-gray-100 cursor-pointer group" 
                onClick={() => openEdit(p)}
              >
                <CardContent className="pt-6">
                  <div className="flex justify-between mb-4">
                    <h3 className="font-extrabold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                      {p.name}
                    </h3>
                    <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-none">
                      {p.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 mb-4 border-l-2 border-indigo-50 pl-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-3.5 h-3.5 text-indigo-400" /> 
                      {p.assigned_person || 'No Lead Assigned'}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" /> 
                      {p.start_date || 'N/A'} — {p.end_date || 'N/A'}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-50 flex justify-between items-center">
                    <div className="flex items-center text-green-600 font-bold">
                      <span className="text-xs mr-0.5">{currencySymbols[p.currency || 'PHP']}</span>
                      {parseFloat(p.budget || 0).toLocaleString()}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-gray-300 hover:text-red-500 hover:bg-red-50" 
                      onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(p.id); }}
                    >
                      <Trash2 className="w-4 h-4"/>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <NewProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        project={editingProject} 
      />
    </div>
  );
}