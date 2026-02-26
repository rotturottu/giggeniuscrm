import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import HRDepartments from '../components/hr/HRDepartments.jsx';
import HREmployees from '../components/hr/HREmployees.jsx';
import HRLeave from '../components/hr/HRLeave.jsx';
import HROnboarding from '../components/hr/HROnboarding.jsx';
import HRPayroll from '../components/hr/HRPayroll.jsx';
import HRPerformance from '../components/hr/HRPerformance.jsx';
import HRTeamManagement from '../components/hr/HRTeamManagement.jsx';
import HRTimeTracker from '../components/hr/HRTimeTracker.jsx';

export default function HR() {
  const [tab, setTab] = useState('employees');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            HR Management
          </h1>
          <p className="text-gray-500 mt-1">Employees, departments, leave, payroll, performance, onboarding & time tracking</p>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex-wrap h-auto gap-1 bg-white border border-gray-200 shadow-sm p-1 rounded-xl mb-6">
            <TabsTrigger value="employees" className="rounded-lg">👥 Employees</TabsTrigger>
            <TabsTrigger value="departments" className="rounded-lg">🏢 Departments</TabsTrigger>
            <TabsTrigger value="leave" className="rounded-lg">🌴 Leave</TabsTrigger>
            <TabsTrigger value="payroll" className="rounded-lg">💰 Payroll</TabsTrigger>
            <TabsTrigger value="performance" className="rounded-lg">⭐ Performance</TabsTrigger>
            <TabsTrigger value="onboarding" className="rounded-lg">🚀 Onboarding</TabsTrigger>
            <TabsTrigger value="time" className="rounded-lg">⏱ Time Tracker</TabsTrigger>
            <TabsTrigger value="team" className="rounded-lg">🛡️ Team Management</TabsTrigger>
          </TabsList>

          <TabsContent value="employees"><HREmployees /></TabsContent>
          <TabsContent value="departments"><HRDepartments /></TabsContent>
          <TabsContent value="leave"><HRLeave /></TabsContent>
          <TabsContent value="payroll"><HRPayroll /></TabsContent>
          <TabsContent value="performance"><HRPerformance /></TabsContent>
          <TabsContent value="onboarding"><HROnboarding /></TabsContent>
          <TabsContent value="time"><HRTimeTracker /></TabsContent>
          <TabsContent value="team"><HRTeamManagement /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}