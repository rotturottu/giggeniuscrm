import React, { useState } from 'react';
import { 
  X, Calendar, User, Upload, Save, ChevronDown, DollarSign, FileText
} from 'lucide-react';

export default function NewProjectModal({ isOpen, onClose }) {
  const [fileName, setFileName] = useState('');
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Project Initiation</h2>
            <p className="text-xs text-gray-500">Fill out the formal details to start a new project</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 flex-1">
          
          {/* Project Title */}
          <div className="space-y-1.5">
            <Label text="Project Title" required />
            <input 
              type="text" 
              placeholder="e.g. Website Development 2026" 
              className="w-full text-base border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Assigned Person */}
            <div className="space-y-1.5">
              <Label text="Assigned Person" />
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Lead name..." 
                  className="w-full border border-gray-200 rounded-lg py-2.5 pl-10 pr-3 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Budget Section */}
            <div className="space-y-1.5">
              <Label text="Initial Budget" />
              <div className="flex">
                <select className="border border-gray-200 border-r-0 rounded-l-lg bg-gray-50 px-3 text-sm focus:outline-none focus:border-purple-500">
                  <option>PHP (₱)</option>
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                </select>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  className="w-full border border-gray-200 rounded-r-lg p-2.5 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label text="Start Date" />
              <input type="date" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-purple-500" />
            </div>
            <div className="space-y-1.5">
              <Label text="Target Completion" />
              <input type="date" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-purple-500" />
            </div>
          </div>

          {/* Project Details */}
          <div className="space-y-1.5">
            <Label text="Project Details / Scope of Work" />
            <textarea 
              placeholder="Outline project objectives and main deliverables..." 
              className="w-full border border-gray-200 rounded-lg p-3 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 resize-none text-sm"
            ></textarea>
          </div>

          {/* Signed Contract Upload */}
          <div className="space-y-2">
            <Label text="Signed Contract Copy" />
            <div className="relative group">
              <input 
                type="file" 
                id="contract-upload"
                className="hidden" 
                onChange={(e) => setFileName(e.target.files[0]?.name)}
              />
              <label 
                htmlFor="contract-upload"
                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50 hover:bg-purple-50/30 hover:border-purple-300 cursor-pointer transition-all"
              >
                <Upload className="w-8 h-8 text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-700">
                  {fileName ? fileName : "Upload formal signed copy"}
                </span>
                <span className="text-xs text-gray-400 mt-1">Supports PDF, JPG, PNG (Max 20MB)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-6 flex justify-end gap-3 bg-white rounded-b-xl">
          <button 
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button className="px-6 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700 shadow-md flex items-center gap-2 transform active:scale-95 transition-all">
            <Save className="w-4 h-4" /> Initialize Project
          </button>
        </div>

      </div>
    </div>
  );
}

// Helper Label Component
function Label({ text, required }) {
  return (
    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">
      {text} {required && <span className="text-red-500">*</span>}
    </label>
  );
}