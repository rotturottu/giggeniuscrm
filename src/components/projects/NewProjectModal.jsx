import React, { useState, useEffect } from 'react';
import { 
  X, User, Upload, Save, Calendar, FileText, 
  ChevronDown, DollarSign, Info, Briefcase
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

export default function NewProjectModal({ isOpen, onClose, project }) {
  const qc = useQueryClient();
  
  // 1. STATE MANAGEMENT
  const [formData, setFormData] = useState({
    name: '',
    assigned_person: '',
    start_date: '',
    end_date: '',
    description: '',
    budget: '',
    currency: 'PHP',
    status: 'active'
  });
  const [file, setFile] = useState(null);

  // 2. MODIFIABILITY LOGIC
  useEffect(() => {
    if (project) {
      // If editing, populate with existing data
      setFormData({
        id: project.id,
        name: project.name || '',
        assigned_person: project.assigned_person || '',
        start_date: project.start_date || '',
        end_date: project.end_date || '',
        description: project.description || '',
        budget: project.budget || '',
        currency: project.currency || 'PHP',
        status: project.status || 'active'
      });
    } else {
      // If new project, reset to empty
      setFormData({
        name: '',
        assigned_person: '',
        start_date: '',
        end_date: '',
        description: '',
        budget: '',
        currency: 'PHP',
        status: 'active'
      });
    }
    setFile(null);
  }, [project, isOpen]);

  // 3. DATABASE MUTATION
  const mutation = useMutation({
    mutationFn: (data) => data.id 
      ? base44.entities.Project.update(data.id, data) 
      : base44.entities.Project.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      onClose();
    },
    onError: (err) => alert("Database Error: " + err.message)
  });

  if (!isOpen) return null;

  // 4. ACTION HANDLERS
  const handleAction = (targetStatus) => {
    if (!formData.name) return alert("Please enter a Project Title");
    
    mutation.mutate({ 
      ...formData, 
      status: targetStatus,
      signed_contract: file ? file.name : formData.signed_contract 
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto flex flex-col border border-gray-100">
        
        {/* Header Section */}
        <div className="flex justify-between items-center p-6 border-b border-gray-50 bg-gray-50/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Briefcase className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                {formData.id ? 'Modify Project Record' : 'Initialize New Project'}
              </h2>
              <p className="text-xs text-gray-500 font-medium">Internal Project Initiation Phase</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-white rounded-full transition-all border border-transparent hover:border-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-8 space-y-8 flex-1 text-left">
          
          {/* Project Title Field */}
          <div className="space-y-2 text-left">
            <Label text="Project Title" required />
            <input 
              type="text" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              className="w-full border-2 border-gray-100 rounded-xl p-3 text-base font-medium focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all placeholder:text-gray-300" 
              placeholder="e.g. Enterprise CRM Development"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Assigned Lead Field */}
            <div className="space-y-2 text-left">
              <Label text="Assigned Project Lead" />
              <div className="relative group">
                <div className="absolute left-3 top-3.5 p-0.5 rounded transition-colors group-focus-within:text-purple-600 text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input 
                  type="text" 
                  value={formData.assigned_person} 
                  onChange={e => setFormData({...formData, assigned_person: e.target.value})} 
                  className="w-full border-2 border-gray-100 rounded-xl py-3 pl-10 pr-4 text-sm font-semibold focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all" 
                  placeholder="Full Name"
                />
              </div>
            </div>

            {/* Budget & Currency Field */}
            <div className="space-y-2 text-left">
              <Label text="Estimated Initial Budget" />
              <div className="flex group">
                <select 
                  value={formData.currency} 
                  onChange={e => setFormData({...formData, currency: e.target.value})} 
                  className="border-2 border-gray-100 border-r-0 rounded-l-xl bg-gray-50 px-3 text-xs font-bold text-gray-600 outline-none focus:border-purple-500 transition-all cursor-pointer"
                >
                  <option value="PHP">PHP (₱)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
                <input 
                  type="number" 
                  value={formData.budget} 
                  onChange={e => setFormData({...formData, budget: e.target.value})} 
                  className="w-full border-2 border-gray-100 rounded-r-xl p-3 text-sm font-bold focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all" 
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 text-left">
              <Label text="Start Date" />
              <div className="relative">
                <Calendar className="absolute right-3 top-3 w-4 h-4 text-gray-300 pointer-events-none" />
                <input 
                  type="date" 
                  value={formData.start_date} 
                  onChange={e => setFormData({...formData, start_date: e.target.value})} 
                  className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm font-medium focus:border-purple-500 outline-none appearance-none" 
                />
              </div>
            </div>
            <div className="space-y-2 text-left">
              <Label text="Target Completion" />
              <div className="relative">
                <Calendar className="absolute right-3 top-3 w-4 h-4 text-gray-300 pointer-events-none" />
                <input 
                  type="date" 
                  value={formData.end_date} 
                  onChange={e => setFormData({...formData, end_date: e.target.value})} 
                  className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm font-medium focus:border-purple-500 outline-none appearance-none" 
                />
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-2 text-left">
            <Label text="Project Scope & Objectives" />
            <textarea 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              className="w-full border-2 border-gray-100 rounded-xl p-4 min-h-[140px] resize-none text-sm font-medium focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all" 
              placeholder="Outline the key deliverables and project scope here..."
            />
          </div>

          {/* File Upload Section */}
          <div className="space-y-3">
            <Label text="Formal Signed Contract" />
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center bg-gray-50/50 hover:bg-purple-50/30 hover:border-purple-200 transition-all cursor-pointer group relative">
              <input 
                type="file" 
                id="file-up" 
                className="hidden" 
                onChange={(e) => setFile(e.target.files[0])} 
              />
              <label htmlFor="file-up" className="cursor-pointer flex flex-col items-center">
                <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 text-purple-500" />
                </div>
                <span className="text-sm font-bold text-gray-700 block">
                  {file ? file.name : (formData.signed_contract || "Upload Signed Contract PDF")}
                </span>
                <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-widest font-bold">Max File Size: 20MB</p>
              </label>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-100 p-6 flex flex-col sm:flex-row justify-end gap-3 bg-white rounded-b-2xl shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
          <Button 
            variant="outline" 
            onClick={() => handleAction('draft')} 
            className="order-2 sm:order-1 gap-2 bg-white text-gray-600 border-gray-200 h-11 px-6 rounded-xl hover:bg-gray-50 font-bold text-sm"
          >
            <Save className="w-4 h-4" /> Save as Draft
          </Button>
          <Button 
            onClick={() => handleAction('active')} 
            disabled={mutation.isPending}
            className="order-1 sm:order-2 h-11 px-8 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-purple-200 hover:shadow-purple-300 hover:opacity-95 transition-all flex items-center gap-2 active:scale-95"
          >
            {mutation.isPending ? "Syncing..." : (formData.id ? "Update Project" : "Initialize Project")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Label({ text, required }) {
  return (
    <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.1em] block ml-1">
      {text} {required && <span className="text-red-500 text-sm">*</span>}
    </label>
  );
}