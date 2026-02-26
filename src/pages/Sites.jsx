import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Crown } from 'lucide-react';
import { useState } from 'react';
import SitesBlog from '../components/sites/SitesBlog.jsx';
import SitesBuilder from '../components/sites/SitesBuilder.jsx';
import SitesCommunity from '../components/sites/SitesCommunity.jsx';
import SitesCourses from '../components/sites/SitesCourses.jsx';
import SitesForms from '../components/sites/SitesForms.jsx';
import SitesPayments from '../components/sites/SitesPayments.jsx';
import SitesPortal from '../components/sites/SitesPortal.jsx';
import SitesQuizzes from '../components/sites/SitesQuizzes.jsx';

export default function Sites() {
  const [activeTab, setActiveTab] = useState('builder');

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Sites
              </h1>
              <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 gap-1">
                <Crown className="w-3 h-3" /> Elite Plan
              </Badge>
            </div>
            <p className="text-gray-500">Build websites, funnels, forms, blogs, portals, courses & more</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-0">
          <TabsList className="flex-wrap h-auto gap-1 bg-white border border-gray-200 shadow-sm p-1 rounded-xl mb-6">
            <TabsTrigger value="builder" className="rounded-lg">🌐 Builder</TabsTrigger>
            <TabsTrigger value="forms" className="rounded-lg">📋 Forms</TabsTrigger>
            <TabsTrigger value="blog" className="rounded-lg">📝 Blog / Articles</TabsTrigger>
            <TabsTrigger value="portal" className="rounded-lg">🔐 Client Portal</TabsTrigger>
            <TabsTrigger value="quizzes" className="rounded-lg">🧠 Quizzes</TabsTrigger>
            <TabsTrigger value="courses" className="rounded-lg">🎓 Courses</TabsTrigger>
            <TabsTrigger value="community" className="rounded-lg">👥 Community</TabsTrigger>
            <TabsTrigger value="payments" className="rounded-lg">💳 Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="builder"><SitesBuilder /></TabsContent>
          <TabsContent value="forms"><SitesForms /></TabsContent>
          <TabsContent value="blog"><SitesBlog /></TabsContent>
          <TabsContent value="portal"><SitesPortal /></TabsContent>
          <TabsContent value="quizzes"><SitesQuizzes /></TabsContent>
          <TabsContent value="courses"><SitesCourses /></TabsContent>
          <TabsContent value="community"><SitesCommunity /></TabsContent>
          <TabsContent value="payments"><SitesPayments /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}