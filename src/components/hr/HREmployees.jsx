import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, Search } from 'lucide-react';

export default function HREmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // SAFE FETCH: This prevents the page from crashing if the backend is down
  useEffect(() => {
    fetch('http://72.61.114.146:5000/api/hr/employees')
      .then(res => res.json())
      .then(data => {
        setEmployees(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Database connection failed:", err);
        setEmployees([]); // Fallback to empty list instead of crashing
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-white rounded-xl border p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Employee Directory</h2>
        <Button className="gap-2">
          <UserPlus className="w-4 h-4" /> Add Employee
        </Button>
      </div>

      {loading ? (
        <p className="text-center py-10">Loading employees...</p>
      ) : employees.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
          <p className="text-gray-500">No employees found in the database.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-sm text-gray-500 uppercase">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Position</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{emp.full_name}</td>
                  <td className="py-3 px-4 text-gray-600">{emp.job_title}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                      {emp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}