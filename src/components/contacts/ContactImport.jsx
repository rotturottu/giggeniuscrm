import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Upload, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactImport({ onDone }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const queryClient = useQueryClient();

  const handleFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setResult(null);

    // Upload + extract
    setImporting(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
    const extracted = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url,
      json_schema: {
        type: 'object',
        properties: {
          contacts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                first_name: { type: 'string' },
                last_name: { type: 'string' },
                email: { type: 'string' },
                company: { type: 'string' },
                phone: { type: 'string' },
                contact_type: { type: 'string' },
                tags: { type: 'array', items: { type: 'string' } },
              }
            }
          }
        }
      }
    });
    setImporting(false);

    if (extracted.status === 'error') {
      toast.error('Could not parse file: ' + extracted.details);
      return;
    }

    const rows = Array.isArray(extracted.output) ? extracted.output : (extracted.output?.contacts || []);
    setPreview(rows.slice(0, 5));
    setFile({ ...f, rows });
  };

  const handleImport = async () => {
    const rows = file?.rows;
    if (!rows?.length) return;
    const valid = rows.filter(r => r.email);
    if (!valid.length) { toast.error('No valid rows with email found'); return; }
    setImporting(true);
    await base44.entities.Contact.bulkCreate(valid.map(r => ({
      ...r,
      contact_type: r.contact_type || 'lead',
      status: 'subscribed',
    })));
    setImporting(false);
    setResult({ count: valid.length });
    queryClient.invalidateQueries({ queryKey: ['contacts'] });
    toast.success(`${valid.length} contacts imported`);
  };

  return (
    <div className="space-y-5 max-w-lg">
      <div>
        <p className="text-sm text-gray-600 mb-3">
          Upload a CSV, Excel, or JSON file. Columns: <code className="bg-gray-100 px-1 rounded text-xs">first_name, last_name, email, company, phone, contact_type, tags</code>
        </p>
        <label className="flex flex-col items-center gap-3 cursor-pointer border-2 border-dashed border-gray-200 rounded-xl p-8 hover:border-blue-300 hover:bg-blue-50 transition-all">
          <Upload className="w-8 h-8 text-gray-400" />
          <span className="text-sm text-gray-500">{file?.name || 'Click to upload file (CSV, Excel, JSON)'}</span>
          <input type="file" className="hidden" accept=".csv,.xlsx,.xls,.json" onChange={handleFile} />
        </label>
      </div>

      {importing && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          Processing file...
        </div>
      )}

      {preview.length > 0 && !result && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Preview ({file?.rows?.length} rows detected)
          </p>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  {['first_name', 'last_name', 'email', 'company', 'phone'].map(col => (
                    <th key={col} className="px-3 py-2 text-left text-gray-500 font-medium">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {preview.map((row, i) => (
                  <tr key={i}>
                    {['first_name', 'last_name', 'email', 'company', 'phone'].map(col => (
                      <td key={col} className="px-3 py-2 text-gray-700 truncate max-w-[100px]">{row[col] || '—'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button onClick={handleImport} disabled={importing} className="bg-gradient-to-r from-blue-600 to-purple-600">
            Import {file?.rows?.length} Contacts
          </Button>
        </div>
      )}

      {result && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-800">Import complete!</p>
            <p className="text-xs text-green-700">{result.count} contacts added successfully.</p>
          </div>
          <Button variant="outline" size="sm" className="ml-auto" onClick={onDone}>Done</Button>
        </div>
      )}
    </div>
  );
}