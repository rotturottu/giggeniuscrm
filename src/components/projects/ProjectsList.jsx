import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Plus, FolderKanban, Search, Calendar, User, DollarSign } from 'lucide-react';
import NewProjectModal from './NewProjectModal';

const currencySymbols = { USD: '$', EUR: '€', PHP: '₱', CAD: 'C$', AUD: 'A$' };

export default function ProjectsList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list('-created_date'),
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

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm bg-white/80 backdrop-blur">
        <CardHeader className="border-b pb-6">
          <div className="flex justify-between items-center mb-4">
            <CardTitle className="text-2xl font-bold">Project Management</CardTitle>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-md hover:opacity-90"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search by project title..." 
              className="pl-10 h-11 bg-gray-50/50 border-gray-200" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="pt-8">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-16 bg-gray-50/30 rounded-xl border-2 border-dashed border-gray-100">
              <FolderKanban className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-medium italic">No projects found. Start by creating a new initiation.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map(project => (
                <Card key={project.id} className="hover:shadow-lg transition-all border-gray-100 group">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-extrabold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">{project.name}</h3>
                      <Badge className={`${statusColors[project.status] || 'bg-indigo-50 text-indigo-600'} border-none px-3`}>
                        {project.status || 'Active'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 mb-4 border-l-2 border-indigo-100 pl-3">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <User className="w-3.5 h-3.5" /> 
                        <span className="font-medium text-gray-700">{project.assigned_person || 'No lead assigned'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Calendar className="w-3.5 h-3.5" /> 
                        {project.start_date ? `${project.start_date} to ${project.end_date}` : 'Timeline not set'}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                      <div className="flex items-center text-green-600 font-bold">
                        {currencySymbols[project.currency || 'PHP']} {parseFloat(project.budget || 0).toLocaleString()}
                      </div>
                      {project.signed_contract && (
                        <Badge variant="outline" className="text-[10px] uppercase text-blue-500 border-blue-200">Contract Attached</Badge>
                      )}
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
      />
    </div>
  );
}