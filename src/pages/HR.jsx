import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, Component } from 'react';
import { AlertCircle } from 'lucide-react';

// Sub-components
import HRDepartments from '../components/hr/HRDepartments.jsx';
import HREmployees from '../components/hr/HREmployees.jsx';
import HRLeave from '../components/hr/HRLeave.jsx';
import HROnboarding from '../components/hr/HROnboarding.jsx';
import HRPayroll from '../components/hr/HRPayroll.jsx';
import HRPerformance from '../components/hr/HRPerformance.jsx';
import HRTeamManagement from '../components/hr/HRTeamManagement.jsx';
import HRTimeTracker from '../components/hr/HRTimeTracker.jsx';

/**
 * HR SAFETY WRAPPER
 * Prevents a crash in one HR module from breaking the whole page.
 */
class HRTabErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-amber-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Module Temporarily Offline</h3>
          <p className="text-slate-500 text-sm max-w-xs mt-2">
            This HR section couldn't load its data. Please ensure your backend is running and refresh the page.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function HR() {
  const [tab, setTab] = useState('employees');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
            HR Management
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Manage your workforce, departments, payroll, and performance tracking.
          </p>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="space-y-8">
          <TabsList className="flex flex-wrap h-auto gap-2 bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm p-1.5 rounded-2xl overflow-x-auto justify-start">
            <TabsTrigger value="employees" className="rounded-xl px-4 py-2 text-sm font-semibold transition-all">👥 Employees</TabsTrigger>
            <TabsTrigger value="departments" className="rounded-xl px-4 py-2 text-sm font-semibold transition-all">🏢 Departments</TabsTrigger>
            <TabsTrigger value="leave" className="rounded-xl px-4 py-2 text-sm font-semibold transition-all">🌴 Leave</TabsTrigger>
            <TabsTrigger value="payroll" className="rounded-xl px-4 py-2 text-sm font-semibold transition-all">💰 Payroll</TabsTrigger>
            <TabsTrigger value="performance" className="rounded-xl px-4 py-2 text-sm font-semibold transition-all">⭐ Performance</TabsTrigger>
            <TabsTrigger value="onboarding" className="rounded-xl px-4 py-2 text-sm font-semibold transition-all">🚀 Onboarding</TabsTrigger>
            <TabsTrigger value="time" className="rounded-xl px-4 py-2 text-sm font-semibold transition-all">⏱ Time</TabsTrigger>
            <TabsTrigger value="team" className="rounded-xl px-4 py-2 text-sm font-semibold transition-all">🛡️ Teams</TabsTrigger>
          </TabsList>

          {/* Individual Tab Contents with Error Protection */}
          <div className="mt-4 focus-visible:outline-none">
            <TabsContent value="employees">
              <HRTabErrorBoundary><HREmployees /></HRTabErrorBoundary>
            </TabsContent>
            <TabsContent value="departments">
              <HRTabErrorBoundary><HRDepartments /></HRTabErrorBoundary>
            </TabsContent>
            <TabsContent value="leave">
              <HRTabErrorBoundary><HRLeave /></HRTabErrorBoundary>
            </TabsContent>
            <TabsContent value="payroll">
              <HRTabErrorBoundary><HRPayroll /></HRTabErrorBoundary>
            </TabsContent>
            <TabsContent value="performance">
              <HRTabErrorBoundary><HRPerformance /></HRTabErrorBoundary>
            </TabsContent>
            <TabsContent value="onboarding">
              <HRTabErrorBoundary><HROnboarding /></HRTabErrorBoundary>
            </TabsContent>
            <TabsContent value="time">
              <HRTabErrorBoundary><HRTimeTracker /></HRTabErrorBoundary>
            </TabsContent>
            <TabsContent value="team">
              <HRTabErrorBoundary><HRTeamManagement /></HRTabErrorBoundary>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}