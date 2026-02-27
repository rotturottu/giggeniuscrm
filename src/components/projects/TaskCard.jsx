import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Paperclip, Play, Pause, Clock, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const priorityColors = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
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
        setElapsed(base + Math.floor((Date.now() - startedAt) / 1000));
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

export default function TaskCard({ task, onEdit, onStatusChange, isPaidUser }) {
  const queryClient = useQueryClient();

  const timerMutation = useMutation({
    mutationFn: (data) => base44.entities.ProjectTask.update(task.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project-tasks'] }),
  });

  const handleStartTimer = (e) => {
    e.stopPropagation();
    timerMutation.mutate({
      timer_running: true,
      timer_started_at: new Date().toISOString(),
      time_spent_seconds: task.time_spent_seconds || 0,
      status: 'in_progress',
    });
    if (task.status === 'todo') onStatusChange('in_progress');
  };

  const handlePauseTimer = (e) => {
    e.stopPropagation();
    const started = new Date(task.timer_started_at).getTime();
    const elapsed = Math.floor((Date.now() - started) / 1000);
    timerMutation.mutate({
      timer_running: false,
      timer_started_at: null,
      time_spent_seconds: (task.time_spent_seconds || 0) + elapsed,
    });
  };

  return (
    <Card className="hover:shadow-md transition-all cursor-pointer" onClick={() => onEdit(task)}>
      <CardContent className="p-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium text-sm line-clamp-2">{task.title}</p>
            <Badge className={`${priorityColors[task.priority]} text-xs flex-shrink-0`}>
              {task.priority}
            </Badge>
          </div>

          {task.description && (
            <p className="text-xs text-gray-600 line-clamp-2">{task.description}</p>
          )}

          {task.subtasks?.length > 0 && (
            <div className="text-xs text-gray-500">
              ✓ {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks
            </div>
          )}

          <div className="flex flex-wrap gap-2 text-xs text-gray-600">
            {task.due_date && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(task.due_date), 'MMM d')}
                {task.due_time && ` ${task.due_time}`}
              </div>
            )}
            {task.assigned_to && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {task.assigned_to.split('@')[0]}
              </div>
            )}
            {task.attachments?.length > 0 && (
              <div className="flex items-center gap-1">
                <Paperclip className="w-3 h-3" />
                {task.attachments.length}
              </div>
            )}
          </div>

          {task.is_recurring && (
            <Badge variant="outline" className="text-xs">
              ↻ {task.recurrence_pattern}
            </Badge>
          )}

          {/* Timer (paid) */}
          {isPaidUser ? (
            <div className="flex items-center justify-between pt-1 border-t" onClick={e => e.stopPropagation()}>
              <TimerDisplay task={task} />
              {task.timer_running ? (
                <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={handlePauseTimer}>
                  <Pause className="w-3 h-3 mr-1" /> Pause
                </Button>
              ) : (
                <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={handleStartTimer}>
                  <Play className="w-3 h-3 mr-1" /> Start
                </Button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1 pt-1 border-t text-xs text-gray-400" onClick={e => e.stopPropagation()}>
              <Lock className="w-3 h-3" /> Time tracking (Pro)
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}