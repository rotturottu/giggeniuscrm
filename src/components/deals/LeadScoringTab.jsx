import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Users, TrendingUp, Award, BarChart3 } from 'lucide-react';
import ScoringRulesList from '../scoring/ScoringRulesList';
import ScoringRuleBuilder from '../scoring/ScoringRuleBuilder';
import TopScoredLeads from '../scoring/TopScoredLeads';
import LeadScoreDistribution from '../scoring/LeadScoreDistribution';

export default function LeadScoringTab() {
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  // Mock data for display - in real use these would come from your useQuery
  const stats = [
    { label: 'Total Leads', value: '0', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Average Score', value: '0', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Grade A Leads', value: '0', icon: Award, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setShowRuleBuilder(true);
  };

  const handleClose = () => {
    setShowRuleBuilder(false);
    setEditingRule(null);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      <Tabs defaultValue="overview" className="w-full">
        <div className="flex items-center justify-between mb-8">
          <TabsList className="grid w-[300px] grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="rules">Scoring Rules</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-8">
          {/* 1. TOP STATS ROW - Spans Full Width */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, i) => (
              <Card key={i} className="border-none shadow-sm overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                      <h3 className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                    </div>
                    <div className={`p-3 ${stat.bg} rounded-xl ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 2. CENTERED EMPTY STATE (Only shows if no data) */}
          <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-2xl bg-white/50">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
               <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No scored leads yet</h3>
            <p className="text-sm text-gray-500 text-center max-w-xs mt-1">
              Leads will appear here once you've set up your scoring rules in the "Scoring Rules" tab.
            </p>
          </div>

          {/* 3. VISUALIZATIONS - Now larger and centered */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <Card className="shadow-sm border-none bg-white p-4">
               <h4 className="font-bold text-gray-800 mb-4 px-2">Lead Rankings</h4>
               <TopScoredLeads />
            </Card>
            <Card className="shadow-sm border-none bg-white p-4">
               <h4 className="font-bold text-gray-800 mb-4 px-2">Score Distribution</h4>
               <LeadScoreDistribution />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rules" className="outline-none">
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="pt-6">
              <ScoringRulesList onEdit={handleEdit} onCreateNew={() => setShowRuleBuilder(true)} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ScoringRuleBuilder
        open={showRuleBuilder}
        onClose={handleClose}
        rule={editingRule}
      />
    </div>
  );
}