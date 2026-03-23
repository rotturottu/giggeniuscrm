import React from 'react';
import { 
  X, Calendar, Bell, RefreshCw, User, Plus, Upload, Lock, Save, ChevronDown
} from 'lucide-react';

export default function NewProjectModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-2">
          <h2 className="text-xl font-semibold text-gray-900">New Project</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 flex-1">
          {/* Title Input */}
          <input 
            type="text" 
            placeholder="Project title..." 
            className="w-full text-lg border-b border-gray-200 pb-2 focus:outline-none focus:border-purple-500 placeholder-gray-400"
          />

          {/* Description */}
          <textarea 
            placeholder="Add description..." 
            className="w-full border border-gray-200 rounded-lg p-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none"
          ></textarea>

          {/* Controls Row 1 */}
          <div className="flex flex-wrap gap-2">
            <button className="flex items-center justify-between px-3 py-1.5 border border-gray-200 rounded-md text-sm text-gray-700 min-w-[120px] hover:bg-gray-50">
              planning <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            <button className="flex items-center justify-between px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md text-sm min-w-[100px] hover:bg-blue-100">
              medium <ChevronDown className="w-4 h-4 opacity-70" />
            </button>
            <button className="flex items-center px-3 py-1.5 border border-gray-200 rounded-md text-sm text-gray-500 min-w-[140px] hover:bg-gray-50">
              <User className="w-4 h-4 mr-2" /> Assignee...
            </button>
          </div>

          {/* Controls Row 2: Dates */}
          <div className="flex gap-2">
            <button className="flex items-center px-3 py-1.5 border border-gray-200 rounded-md text-sm text-gray-600 hover:bg-gray-50">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" /> + Start date
            </button>
            <button className="flex items-center px-3 py-1.5 border border-gray-200 rounded-md text-sm text-gray-600 hover:bg-gray-50">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" /> + Due date
            </button>
          </div>

          {/* Controls Row 3: Toggles */}
          <div className="flex gap-2">
            <button className="flex items-center px-3 py-1.5 border border-gray-200 rounded-md text-sm text-gray-600 hover:bg-gray-50">
              <Bell className="w-4 h-4 mr-2 text-gray-400" /> Notify
            </button>
            <button className="flex items-center px-3 py-1.5 border border-gray-200 rounded-md text-sm text-gray-600 hover:bg-gray-50">
              <RefreshCw className="w-4 h-4 mr-2 text-gray-400" /> Recurring
            </button>
          </div>

          {/* Subtasks Section */}
          <div className="pt-4">
            <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Subtasks</h3>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Add a subtask..." 
                className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
              />
              <button className="p-2 border border-gray-200 rounded-md hover:bg-gray-50">
                <Plus className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Attachments Section */}
          <div className="pt-4">
            <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Attachments</h3>
            <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer transition-colors">
              <p className="text-sm text-gray-500 flex items-center justify-center">
                <Upload className="w-4 h-4 mr-2" /> Click to attach a file (max 50 MB)
              </p>
            </div>
          </div>

          {/* Pro Banner */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center text-sm text-orange-700 mt-4">
            <Lock className="w-4 h-4 mr-2 text-orange-500" />
            <span className="font-semibold mr-1">Pro:</span> Time tracking & automations require a paid plan.
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-4 flex justify-end gap-3 bg-gray-50/50 rounded-b-xl">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 flex items-center">
            <Save className="w-4 h-4 mr-2" /> Create
          </button>
        </div>

      </div>
    </div>
  );
}
