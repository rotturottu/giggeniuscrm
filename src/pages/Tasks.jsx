import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckSquare, FolderKanban } from 'lucide-react';
import ProjectsList from '../components/projects/ProjectsList';
import TaskBoard from '../components/projects/TaskBoard';

export default function Tasks() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Tasks & Projects
          </h1>
          <p className="text-gray-600">Organize projects and manage team tasks</p>
        </div>

        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList>
            <TabsTrigger value="tasks">
              <CheckSquare className="w-4 h-4 mr-2" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="projects">
              <FolderKanban className="w-4 h-4 mr-2" />
              Projects
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks">
            <TaskBoard />
          </TabsContent>

          <TabsContent value="projects">
            <ProjectsList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}