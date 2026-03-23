import React, { useState, useEffect } from 'react';
import { X, User, Upload, Save, Calendar } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

export default function NewProjectModal({ isOpen, onClose, project }) {
  const qc = useQueryClient();
  
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

  // Sync form data when editing an existing project or opening for a new one
  useEffect(() => {
    if (project) {
      setFormData({ ...project });
    } else {
      setFormData({ 
        name: '', 
        assigned_person: '', 
        start_date: '', 
        end_date: '', 
        description: '', 
        budget: '', 
        currency: 'PHP' 
      });
    }
    setFile(null);
  }, [project, isOpen]);

  const mutation = useMutation({
    mutationFn: (data) => data.id 
      ? base44.entities.Project.update(data.id, data) 
      : base44.entities.Project.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      onClose();
    }
  });

  if (!isOpen) return null;

  const handleAction = (status = 'active') => {
    if (!formData.name) return alert("Project Title is required");
    
    mutation.mutate({ 
      ...formData, 
      status, 
      signed_contract: file ? file.name : formData.signed_contract 
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {formData.id ? 'Edit Project Details' : 'Project Initiation'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-1">
            <Label text="Project Title" required />
            <input 
              type="text" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              className="w-full border rounded-lg p-2.5 outline-none focus:border-purple-600" 
              placeholder="e.g. CRM Development"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label text="Assigned Lead" />
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  value={formData.assigned_person} 
                  onChange={e => setFormData({...formData, assigned_person: e.target.value})} 
                  className="w-full border rounded-lg py-2.5 pl-10 pr-3 outline-none focus:border-purple-500" 
                  placeholder="Lead Name"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label text="Initial Budget" />
              <div className="flex">
                <select 
                  value={formData.currency} 
                  onChange={e => setFormData({...formData, currency: e.target.value})} 
                  className="border border-r-0 rounded-l-lg bg-gray-50 px-2 outline-none text-sm"
                >
                  <option value="PHP">PHP (₱)</option>
                  <option value="USD">USD ($)</option>
                </select>
                <input 
                  type="number" 
                  value={formData.budget} 
                  onChange={e => setFormData({...formData, budget: e.target.value})} 
                  className="w-full border rounded-r-lg p-2.5 outline-none focus:border-purple-500" 
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label text="Start Date" />
              <input 
                type="date" 
                value={formData.start_date} 
                onChange={e => setFormData({...formData, start_date: e.target.value})} 
                className="w-full border rounded-lg p-2.5 outline-none focus:border-purple-600" 
              />
            </div>
            <div className="space-y-1">
              <Label text="Target Completion" />
              <input 
                type="date" 
                value={formData.end_date} 
                onChange={e => setFormData({...formData, end_date: e.target.value})} 
                className="w-full border rounded-lg p-2.5 outline-none focus:border-purple-600" 
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label text="Project Details" />
            <textarea 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              className="w-full border rounded-lg p-3 min-h-[100px] resize-none outline-none focus:border-purple-600" 
              placeholder="Outline project objectives..."
            />
          </div>

          <div className="space-y-1">
            <Label text="Signed Contract Copy" />
            <div className="border-2 border-dashed rounded-xl p-6 text-center bg-gray-50 hover:bg-purple-50 transition-colors">
              <input 
                type="file" 
                id="file-up" 
                className="hidden" 
                onChange={(e) => setFile(e.target.files[0])} 
              />
              <label htmlFor="file-up" className="cursor-pointer">
                <Upload className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-700">
                  {file ? file.name : (formData.signed_contract || "Upload signed contract")}
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="border-t p-6 flex justify-end gap-3 bg-gray-50/50">
          <Button 
            variant="outline" 
            onClick={() => handleAction('draft')} 
            className="gap-2 bg-white text-gray-600 border-gray-200"
          >
            <Save className="w-4 h-4" /> Save as Draft
          </Button>
          <Button 
            onClick={() => handleAction('active')} 
            className="bg-purple-600 text-white hover:bg-purple-700 shadow-md"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Processing..." : "Initialize Project"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Label({ text, required }) {
  return (
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block">
      {text} {required && <span className="text-red-500">*</span>}
    </label>
  );
}