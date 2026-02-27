import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, User, Paperclip, ChevronDown, ChevronRight, Play, Pause, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const priorityColors = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

const statusColors = {
  todo: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  review: 'bg-yellow-100 text-yellow-700',
  for_approval: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
};

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
}

function TimerDisplay({ task }) {
  const [elapsed, setElapsed] = React.useState(task.time_spent_seconds || 0);

  React.useEffect(() => {
    let interval;
    if (task.timer_running && task.timer_started_at) {
      const base = task.time_spent_seconds || 0;
      const startedAt = new Date(task.timer_started_at).getTime();
      interval = setInterval(() => {
        const now = Date.now();
        setElapsed(base + Math.floor((now - startedAt) / 1000));
      }, 1000);
    } else {
      setElapsed(task.time_spent_seconds || 0);
    }
    return () => clearInterval(interval);
  }, [task.timer_running, task.timer_started_at, task.time_spent_seconds]);

  return (
    <span className="font-mono text-xs text-gray-600 flex items-center gap-1">
      <Clock className="w-3 h-3" />
      {formatTime(elapsed)}
    </span>
  );
}

export default function TaskListView({ tasks, onEdit, isPaidUser }) {
  const [sortBy, setSortBy] = useState('created_date');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [expandedTasks, setExpandedTasks] = useState({});
  const queryClient = useQueryClient();

  const timerMutation = useMutation({
    mutationFn: ({ id, timer_running, timer_started_at, time_spent_seconds, status }) =>
      base44.entities.ProjectTask.update(id, { timer_running, timer_started_at, time_spent_seconds, status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project-tasks'] }),
  });

  const handleStartTimer = (task) => {
    timerMutation.mutate({
      id: task.id,
      timer_running: true,
      timer_started_at: new Date().toISOString(),
      time_spent_seconds: task.time_spent_seconds || 0,
      status: 'in_progress',
    });
  };

  const handlePauseTimer = (task) => {
    const started = new Date(task.timer_started_at).getTime();
    const elapsed = Math.floor((Date.now() - started) / 1000);
    timerMutation.mutate({
      id: task.id,
      timer_running: false,
      timer_started_at: null,
      time_spent_seconds: (task.time_spent_seconds || 0) + elapsed,
      status: task.status,
    });
  };

  const filtered = tasks.filter(t => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'due_date') return (a.due_date || '').localeCompare(b.due_date || '');
    if (sortBy === 'priority') {
      const order = { urgent: 0, high: 1, medium: 2, low: 3 };
      return (order[a.priority] || 2) - (order[b.priority] || 2);
    }
    return new Date(b.created_date || 0) - new Date(a.created_date || 0);
  });

  const parentTasks = filtered.filter(t => !t.parent_task_id);
  const subtaskMap = {};
  tasks.filter(t => t.parent_task_id).forEach(t => {
    if (!subtaskMap[t.parent_task_id]) subtaskMap[t.parent_task_id] = [];
    subtaskMap[t.parent_task_id].push(t);
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Sort by" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="created_date">Date Created</SelectItem>
            <SelectItem value="due_date">Due Date</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="for_approval">For Approval</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-xl border divide-y">
        {parentTasks.length === 0 && (
          <div className="p-8 text-center text-gray-400">No tasks found</div>
        )}
        {parentTasks.map(task => {
          const subs = subtaskMap[task.id] || [];
          const expanded = expandedTasks[task.id];
          return (
            <div key={task.id}>
              <div
                className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => onEdit(task)}
              >
                {subs.length > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setExpandedTasks(prev => ({ ...prev, [task.id]: !prev[task.id] })); }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                )}
                {subs.length === 0 && <div className="w-4" />}

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{task.title}</p>
                  {task.description && <p className="text-xs text-gray-500 truncate">{task.description}</p>}
                </div>

                <div className="flex items-center gap-3 flex-wrap justify-end">
                  <Badge className={`${priorityColors[task.priority]} text-xs`}>{task.priority}</Badge>
                  <Badge className={`${statusColors[task.status]} text-xs`}>{task.status?.replace('_', ' ')}</Badge>

                  {task.due_date && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(task.due_date), 'MMM d')}
                      {task.due_time && ` ${task.due_time}`}
                    </span>
                  )}

                  {task.assigned_to && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {task.assigned_to.split('@')[0]}
                    </span>
                  )}

                  {task.attachments?.length > 0 && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Paperclip className="w-3 h-3" /> {task.attachments.length}
                    </span>
                  )}

                  {isPaidUser && (
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <TimerDisplay task={task} />
                      {task.timer_running ? (
                        <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={() => handlePauseTimer(task)}>
                          <Pause className="w-3 h-3" />
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={() => handleStartTimer(task)}>
                          <Play className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {expanded && subs.map(sub => (
                <div
                  key={sub.id}
                  className="flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 cursor-pointer pl-12 border-t"
                  onClick={() => onEdit(sub)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">↳ {sub.title}</p>
                  </div>
                  <Badge className={`${statusColors[sub.status]} text-xs`}>{sub.status?.replace('_', ' ')}</Badge>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}