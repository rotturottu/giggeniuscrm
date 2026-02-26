import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Calendar, User, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import TaskForm from './TaskForm';

export default function TasksTab() {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list('-created_date'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Task.update(id, { 
      status,
      completed_at: status === 'completed' ? new Date().toISOString() : null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const priorityColors = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
  };

  const statusIcons = {
    todo: <Circle className="w-5 h-5 text-gray-400" />,
    in_progress: <AlertCircle className="w-5 h-5 text-blue-500" />,
    completed: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    cancelled: <Circle className="w-5 h-5 text-gray-300" />,
  };

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="text-sm text-gray-600 mb-1">To Do</div>
              <div className="text-2xl font-bold text-gray-700">{todoTasks.length}</div>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="text-sm text-gray-600 mb-1">In Progress</div>
              <div className="text-2xl font-bold text-blue-600">{inProgressTasks.length}</div>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="text-sm text-gray-600 mb-1">Completed</div>
              <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
            </CardContent>
          </Card>
        </div>
        <Button
          onClick={() => {
            setEditingTask(null);
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <Card
            key={task.id}
            className={`hover:shadow-lg transition-all ${
              task.status === 'completed' ? 'opacity-60' : ''
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <button
                    onClick={() =>
                      updateStatusMutation.mutate({
                        id: task.id,
                        status: task.status === 'completed' ? 'todo' : 'completed',
                      })
                    }
                    className="mt-1"
                  >
                    {statusIcons[task.status]}
                  </button>
                  <div className="flex-1">
                    <CardTitle
                      className={`text-base ${
                        task.status === 'completed' ? 'line-through text-gray-500' : ''
                      }`}
                    >
                      {task.title}
                    </CardTitle>
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex gap-2">
                <Badge className={priorityColors[task.priority]}>
                  {task.priority}
                </Badge>
                {task.related_to_type && (
                  <Badge variant="outline">{task.related_to_type}</Badge>
                )}
              </div>
              {task.due_date && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(task.due_date), 'MMM d, yyyy')}
                </div>
              )}
              {task.assigned_to && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-3 h-3" />
                  {task.assigned_to.split('@')[0]}
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => {
                  setEditingTask(task);
                  setShowForm(true);
                }}
              >
                Edit
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No tasks yet. Create your first task to get started!
        </div>
      )}

      <TaskForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingTask(null);
        }}
        task={editingTask}
      />
    </div>
  );
}