import React, { useState } from 'react';
import { X, User, Upload, Save, Calendar } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function NewProjectModal({ isOpen, onClose }) {
  const qc = useQueryClient();
  
  // 1. STATE TRACKING FOR INPUTS
  const [formData, setFormData] = useState({
    name: '',
    assigned_person: '',
    start_date: '',
    end_date: '',
    description: '',
    budget: '',
    currency: 'PHP'
  });
  const [file, setFile] = useState(null);

  // 2. DATABASE SAVE LOGIC
  const mutation = useMutation({
    mutationFn: (data) => base44.entities.Project.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      onClose();
      // Reset form
      setFormData({ name: '', assigned_person: '', start_date: '', end_date: '', description: '', budget: '', currency: 'PHP' });
      setFile(null);
    },
    onError: (err) => alert("Save failed: " + err.message)
  });

  if (!isOpen) return null;

  const handleSave = () => {
    if (!formData.name) return alert("Project Title is required");
    // Send to backend
    mutation.mutate({
      ...formData,
      signed_contract: file ? file.name : ''
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Project Initiation</h2>
            <p className="text-xs text-gray-500">Fill out details to start a new project record</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1">
          <div className="space-y-1.5">
            <Label text="Project Title" required />
            <input 
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Website Development" 
              className="w-full border border-gray-200 rounded-lg p-2.5 focus:border-purple-600 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label text="Assigned Person" />
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  value={formData.assigned_person}
                  onChange={e => setFormData({...formData, assigned_person: e.target.value})}
                  placeholder="Lead name..." 
                  className="w-full border border-gray-200 rounded-lg py-2.5 pl-10 pr-3 focus:border-purple-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label text="Initial Budget" />
              <div className="flex">
                <select 
                  value={formData.currency}
                  onChange={e => setFormData({...formData, currency: e.target.value})}
                  className="border border-gray-200 border-r-0 rounded-l-lg bg-gray-50 px-3 text-sm outline-none"
                >
                  <option value="PHP">PHP (₱)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
                <input 
                  type="number" 
                  value={formData.budget}
                  onChange={e => setFormData({...formData, budget: e.target.value})}
                  placeholder="0.00" 
                  className="w-full border border-gray-200 rounded-r-lg p-2.5 focus:border-purple-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label text="Start Date" />
              <input 
                type="date" 
                value={formData.start_date}
                onChange={e => setFormData({...formData, start_date: e.target.value})}
                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none" 
              />
            </div>
            <div className="space-y-1.5">
              <Label text="Target Completion" />
              <input 
                type="date" 
                value={formData.end_date}
                onChange={e => setFormData({...formData, end_date: e.target.value})}
                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none" 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label text="Project Details / Scope of Work" />
            <textarea 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Outline objectives..." 
              className="w-full border border-gray-200 rounded-lg p-3 min-h-[120px] resize-none text-sm outline-none"
            ></textarea>
          </div>

          <div className="space-y-2">
            <Label text="Signed Contract Copy" />
            <div className="relative">
              <input 
                type="file" 
                id="contract-upload"
                className="hidden" 
                onChange={(e) => setFile(e.target.files[0])}
              />
              <label 
                htmlFor="contract-upload"
                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50 hover:bg-purple-50 cursor-pointer transition-all"
              >
                <Upload className="w-8 h-8 text-purple-500 mb-2" />
                <span className="text-sm font-medium text-gray-700">
                  {file ? file.name : "Upload formal signed copy"}
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 p-6 flex justify-end gap-3 bg-white rounded-b-xl">
          <button onClick={onClose} className="px-5 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={mutation.isPending}
            className="px-6 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-md flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> {mutation.isPending ? "Saving..." : "Initialize Project"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Label({ text, required }) {
  return (
    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">
      {text} {required && <span className="text-red-500">*</span>}
    </label>
  );
}