import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, List, Calendar, LayoutGrid } from 'lucide-react';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import TaskListView from './TaskListView';
import TaskCalendarView from './TaskCalendarView';

const STATUS_COLS = [
  { key: 'todo', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'review', label: 'Review' },
  { key: 'for_approval', label: 'For Approval' },
  { key: 'completed', label: 'Completed' },
];

export default function TaskBoard({ isPaidUser = false }) {
  const [view, setView] = useState('board'); // board | list | calendar
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [listFilter, setListFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ['project-tasks'],
    queryFn: () => base44.entities.ProjectTask.list('-created_date'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.ProjectTask.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project-tasks'] }),
  });

  const lists = ['all', ...new Set(tasks.map(t => t.list_name).filter(Boolean))];

  const filteredTasks = tasks.filter(task => {
    const matchesList = listFilter === 'all' || task.list_name === listFilter;
    const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesList && matchesSearch;
  });

  const boardTasks = filteredTasks.filter(t => !t.parent_task_id);
  const tasksByStatus = Object.fromEntries(STATUS_COLS.map(col => [col.key, boardTasks.filter(t => t.status === col.key)]));

  const openEdit = (task) => { setEditingTask(task); setShowTaskForm(true); };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <Input placeholder="Search tasks..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
        </div>

        <Select value={listFilter} onValueChange={setListFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All Lists" /></SelectTrigger>
          <SelectContent>
            {lists.map(list => <SelectItem key={list} value={list}>{list === 'all' ? 'All Lists' : list}</SelectItem>)}
          </SelectContent>
        </Select>

        {/* View switcher */}
        <div className="flex border rounded-lg overflow-hidden">
          {[
            { key: 'list', icon: List, label: 'List' },
            { key: 'calendar', icon: Calendar, label: 'Calendar' },
            { key: 'board', icon: LayoutGrid, label: 'Board' },
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                view === key ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
              title={label}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <Button
          onClick={() => { setEditingTask(null); setShowTaskForm(true); }}
          className="bg-gradient-to-r from-blue-600 to-purple-600"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Task
        </Button>
      </div>

      {/* Views */}
      {view === 'list' && (
        <TaskListView tasks={filteredTasks} onEdit={openEdit} isPaidUser={isPaidUser} />
      )}

      {view === 'calendar' && (
        <TaskCalendarView tasks={filteredTasks} onEdit={openEdit} />
      )}

      {view === 'board' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUS_COLS.map(col => (
            <div key={col.key} className="min-w-[220px] w-56 flex-shrink-0 space-y-3">
              <Card className="bg-gray-50">
                <CardHeader className="p-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>{col.label}</span>
                    <Badge variant="outline">{tasksByStatus[col.key]?.length || 0}</Badge>
                  </CardTitle>
                </CardHeader>
              </Card>

              <div className="space-y-2 min-h-[400px]">
                {tasksByStatus[col.key]?.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isPaidUser={isPaidUser}
                    onEdit={openEdit}
                    onStatusChange={newStatus => updateStatusMutation.mutate({ id: task.id, status: newStatus })}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <TaskForm
        open={showTaskForm}
        onClose={() => { setShowTaskForm(false); setEditingTask(null); }}
        task={editingTask}
        isPaidUser={isPaidUser}
      />
    </div>
  );
}