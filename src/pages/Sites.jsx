import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Crown, AlertTriangle } from 'lucide-react';
import { useState, Component } from 'react';

// Sub-components
import SitesBlog from '../components/sites/SitesBlog.jsx';
import SitesBuilder from '../components/sites/SitesBuilder.jsx';
import SitesCommunity from '../components/sites/SitesCommunity.jsx';
import SitesCourses from '../components/sites/SitesCourses.jsx';
import SitesForms from '../components/sites/SitesForms.jsx';
import SitesPayments from '../components/sites/SitesPayments.jsx';
import SitesPortal from '../components/sites/SitesPortal.jsx';
import SitesQuizzes from '../components/sites/SitesQuizzes.jsx';

/**
 * SAFETY WRAPPER: This stops a crash in one tab 
 * from turning the entire screen white.
 */
class TabErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-12 text-center bg-white rounded-xl border-2 border-dashed border-slate-200">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
          <h3 className="text-lg font-bold text-slate-800">Tab Content Unavailable</h3>
          <p className="text-slate-500 max-w-xs mx-auto text-sm">
            This specific feature is currently being updated or is missing data. 
            Please check the other tabs or the backend logs.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Sites() {
  const [activeTab, setActiveTab] = useState('builder');

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Sites
              </h1>
              <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 gap-1 px-3 py-1 shadow-sm">
                <Crown className="w-3 h-3" /> Elite Plan
              </Badge>
            </div>
            <p className="text-slate-500 font-medium italic">
              Build websites, funnels, forms, and digital portals in one place.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="flex flex-wrap h-auto gap-2 bg-white/50 backdrop-blur-md border border-slate-200 shadow-sm p-1.5 rounded-2xl overflow-x-auto justify-start">
            <TabsTrigger value="builder" className="rounded-xl px-4 py-2 text-sm font-semibold transition-all">🌐 Builder</TabsTrigger>
            <TabsTrigger value="forms" className="rounded-xl px-4 py-2 text-sm font-semibold transition-all">📋 Forms</TabsTrigger>
            <TabsTrigger value="blog" className="rounded-xl px-4 py-2 text-sm font-semibold transition-all">📝 Blog</TabsTrigger>
            <TabsTrigger value="portal" className="rounded-xl px-4 py-2 text-sm font-semibold transition-all">🔐 Portal</TabsTrigger>
            <TabsTrigger value="quizzes" className="rounded-xl px-4 py-2 text-sm font-semibold transition-all">🧠 Quizzes</TabsTrigger>
            <TabsTrigger value="courses" className="rounded-xl px-4 py-2 text-sm font-semibold transition-all">🎓 Courses</TabsTrigger>
            <TabsTrigger value="community" className="rounded-xl px-4 py-2 text-sm font-semibold transition-all">👥 Community</TabsTrigger>
            <TabsTrigger value="payments" className="rounded-xl px-4 py-2 text-sm font-semibold transition-all">💳 Payments</TabsTrigger>
          </TabsList>

          {/* Tab Contents wrapped in Error Boundaries */}
          <div className="mt-4">
            <TabsContent value="builder"><TabErrorBoundary><SitesBuilder /></TabErrorBoundary></TabsContent>
            <TabsContent value="forms"><TabErrorBoundary><SitesForms /></TabErrorBoundary></TabsContent>
            <TabsContent value="blog"><TabErrorBoundary><SitesBlog /></TabErrorBoundary></TabsContent>
            <TabsContent value="portal"><TabErrorBoundary><SitesPortal /></TabErrorBoundary></TabsContent>
            <TabsContent value="quizzes"><TabErrorBoundary><SitesQuizzes /></TabErrorBoundary></TabsContent>
            <TabsContent value="courses"><TabErrorBoundary><SitesCourses /></TabErrorBoundary></TabsContent>
            <TabsContent value="community"><TabErrorBoundary><SitesCommunity /></TabErrorBoundary></TabsContent>
            <TabsContent value="payments"><TabErrorBoundary><SitesPayments /></TabErrorBoundary></TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}