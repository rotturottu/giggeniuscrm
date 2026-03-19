import React, { useState } from 'react';
import { Search, ChevronDown, List, Calendar, LayoutGrid, Plus } from 'lucide-react';

// 1. Define your exact requested workflow steps
const COLUMNS = [
  { id: 'To Do', title: 'To Do' },
  { id: 'In-Progress', title: 'In Progress' },
  { id: 'Review', title: 'Review' },
  { id: 'Approval', title: 'For Approval' }
];

export default function TaskBoard() {
  // 2. State for tasks and the "Add Task" input
  const [tasks, setTasks] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // 3. Logic: Add a new task (Defaults directly to 'todo')
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask = {
      id: Date.now().toString(),
      title: newTaskTitle,
      status: 'todo', // Force new tasks to start in "To Do"
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setIsAdding(false);
  };

  // 4. Logic: Move a task to a different column
  const moveTask = (taskId, newStatus) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col xl:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full xl:max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
            placeholder="Search tasks..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Add Task Button - Toggles the input form */}
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isAdding ? 'Cancel' : 'Add Task'}
          </button>
        </div>
      </div>

      {/* Add Task Input Form (Shows when button is clicked) */}
      {isAdding && (
        <form onSubmit={handleAddTask} className="flex gap-3 bg-white p-4 rounded-xl border border-blue-100 shadow-sm mb-4">
          <input
            autoFocus
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            type="submit"
            className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Save Task
          </button>
        </form>
      )}

      {/* Kanban Board Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(column => (
          <div key={column.id} className="flex-none w-[280px]">
            {/* Column Header */}
            <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
              <span className="font-semibold text-gray-800 text-sm">{column.title}</span>
              <span className="bg-gray-50 text-gray-600 text-xs font-medium px-2 py-1 rounded-md border border-gray-100">
                {tasks.filter(t => t.status === column.id).length}
              </span>
            </div>
            
            {/* Task Cards Container */}
            <div className="mt-4 space-y-3 min-h-[200px] bg-gray-50/50 p-2 rounded-xl border border-dashed border-gray-200">
              {tasks
                .filter(task => task.status === column.id)
                .map(task => (
                  <div key={task.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-sm flex flex-col gap-3 hover:shadow-md transition-shadow">
                    <span className="font-medium text-gray-800">{task.title}</span>
                    
                    {/* Status Changer Dropdown */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-400">Move to:</span>
                      <select 
                        value={task.status}
                        onChange={(e) => moveTask(task.id, e.target.value)}
                        className="text-xs border-gray-200 rounded p-1 text-gray-600 bg-gray-50 cursor-pointer focus:ring-blue-500 focus:border-blue-500"
                      >
                        {COLUMNS.map(col => (
                          <option key={col.id} value={col.id}>{col.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>
              ))}
              {tasks.filter(t => t.status === column.id).length === 0 && (
                <div className="text-center text-xs text-gray-400 py-4">No tasks yet</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}