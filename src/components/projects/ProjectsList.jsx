import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, FolderKanban, Search, Calendar, User, FolderOpen, ChevronDown, Trash2 } from 'lucide-react';
import NewProjectModal from './NewProjectModal';

const currencySymbols = { USD: '$', EUR: '€', PHP: '₱', CAD: 'C$', AUD: 'A$' };

export default function ProjectsList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null); // Track project being modified
  const [searchTerm, setSearchTerm] = useState('');
  const qc = useQueryClient();

  // Fetch 'active' projects for the main list
  const { data: projects = [] } = useQuery({
    queryKey: ['projects', 'active'],
    queryFn: () => base44.entities.Project.filter({ status: 'active' }, '-created_date'),
  });

  // Fetch 'draft' projects for the dropdown
  const { data: drafts = [] } = useQuery({
    queryKey: ['projects', 'drafts'],
    queryFn: () => base44.entities.Project.filter({ status: 'draft' }, '-created_date'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Project.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] })
  });

  const safeProjects = Array.isArray(projects) ? projects : [];

  const filteredProjects = safeProjects.filter(p => 
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColors = {
    planning: 'bg-gray-100 text-gray-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
  };

  // Open modal for a specific project to edit
  const handleEdit = (project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  // Open modal for a completely new project
  const handleNewProject = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm bg-white/80 backdrop-blur">
        <CardHeader className="border-b pb-6">
          <div className="flex justify-between items-center mb-4">
            <CardTitle className="text-2xl font-bold text-gray-800">Project Management</CardTitle>
            <div className="flex gap-2">
              {/* DRAFTS DROPDOWN */}
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
                    <div className="p-4 text-center text-xs text-gray-400">No project drafts</div>
                  ) : (
                    drafts.map(d => (
                      <div key={d.id} className="flex items-center hover:bg-gray-50 px-2 border-b last:border-0">
                        <DropdownMenuItem className="flex-1 cursor-pointer py-2" onClick={() => handleEdit(d)}>
                          <span className="text-sm font-bold truncate">{d.name || '(Untitled Draft)'}</span>
                        </DropdownMenuItem>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-gray-300 hover:text-red-500"
                          onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(d.id); }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button 
                className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-md hover:opacity-90"
                onClick={handleNewProject}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search by project title..." 
              className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus:ring-purple-500" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="pt-8">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-16 bg-gray-50/30 rounded-xl border-2 border-dashed border-gray-100">
              <FolderKanban className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-medium italic">No projects found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map(project => (
                <Card 
                  key={project.id} 
                  className="hover:shadow-lg transition-all border-gray-100 group cursor-pointer"
                  onClick={() => handleEdit(project)} // MAKE CARDS MODIFIABLE
                >
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-extrabold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">{project.name}</h3>
                      <Badge className={`${statusColors[project.status] || 'bg-indigo-50 text-indigo-600'} border-none px-3`}>
                        {project.status || 'Active'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 mb-4 border-l-2 border-indigo-100 pl-3">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <User className="w-3.5 h-3.5 text-indigo-400" /> 
                        <span className="font-medium text-gray-700">{project.assigned_person || 'No lead assigned'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400" /> 
                        {project.start_date ? `${project.start_date} to ${project.end_date}` : 'Timeline not set'}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                      <div className="flex items-center text-green-600 font-bold">
                        {currencySymbols[project.currency || 'PHP']} {parseFloat(project.budget || 0).toLocaleString()}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(project.id); }}
                      >
                        <Trash2 className="w-4 h-4"/>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <NewProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        project={editingProject} // PASS THE PROJECT DATA TO THE MODAL
      />
    </div>
  );
}