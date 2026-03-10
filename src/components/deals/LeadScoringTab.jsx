import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Info, Trophy } from 'lucide-react';
import ScoringRulesList from '../scoring/ScoringRulesList';
import ScoringRuleBuilder from '../scoring/ScoringRuleBuilder';
import TopScoredLeads from '../scoring/TopScoredLeads';
import LeadScoreDistribution from '../scoring/LeadScoreDistribution';

export default function LeadScoringTab() {
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setShowRuleBuilder(true);
  };

  const handleClose = () => {
    setShowRuleBuilder(false);
    setEditingRule(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 animate-in fade-in duration-500 pb-4">
      <Tabs defaultValue="overview" className="w-full">
        {/* Centered Navigation - tighter margin */}
        <div className="flex justify-center mb-4">
          <TabsList className="bg-gray-100/80 p-1 border shadow-sm">
            <TabsTrigger value="overview" className="px-10">Overview</TabsTrigger>
            <TabsTrigger value="rules" className="px-10">Scoring Rules</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4 outline-none">
          {/* Compact Horizontal Status Banner */}
          <div className="relative overflow-hidden bg-white border border-indigo-100 rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="bg-indigo-50 p-3 rounded-full shrink-0 relative z-10">
              <Info className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="flex-1 relative z-10">
              <h3 className="text-lg font-bold text-gray-900">No scored leads yet</h3>
              <p className="text-sm text-gray-500">
                Leads will appear here once scoring rules are applied. Configure them in the 
                <span className="font-semibold text-indigo-600 ml-1">Scoring Rules</span> tab.
              </p>
            </div>
            {/* Background decorative icon */}
            <BarChart3 className="w-24 h-24 text-indigo-50 absolute -right-4 -top-4 opacity-40 pointer-events-none" />
          </div>

          {/* Grid Layout: items-stretch forces both cards to be the same height */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full items-stretch">
            
            {/* Left Card: Lead Rankings */}
            <Card className="border shadow-sm bg-white flex flex-col">
              <CardHeader className="border-b bg-gray-50/50 py-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-800">
                  <Trophy className="w-4 h-4 text-indigo-600" />
                  Lead Rankings
                </CardTitle>
              </CardHeader>
              {/* flex-1 lets the content fill the remaining space so it matches the right card */}
              <CardContent className="p-4 flex-1 flex flex-col">
                <TopScoredLeads />
              </CardContent>
            </Card>

            {/* Right Card: Score Insights */}
            <Card className="border shadow-sm bg-white flex flex-col">
              <CardHeader className="border-b bg-gray-50/50 py-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-800">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  Score Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex-1 flex flex-col">
                <LeadScoreDistribution />
              </CardContent>
            </Card>

          </div>
        </TabsContent>

        <TabsContent value="rules" className="outline-none">
          <Card className="border shadow-sm bg-white overflow-hidden">
            <CardContent className="pt-6">
              <ScoringRulesList onEdit={handleEdit} onCreateNew={() => setShowRuleBuilder(true)} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ScoringRuleBuilder
        open={showRuleBuilder}
        rule={editingRule}
        onClose={handleClose}
      />
    </div>
  );
}