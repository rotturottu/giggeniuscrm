import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, Info } from 'lucide-react';
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
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <Tabs defaultValue="overview" className="w-full">
        {/* Centered Navigation */}
        <div className="flex justify-center mb-8">
          <TabsList className="bg-gray-100/80 p-1 border shadow-sm">
            <TabsTrigger value="overview" className="px-10">Overview</TabsTrigger>
            <TabsTrigger value="rules" className="px-10">Scoring Rules</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-10 outline-none">
          {/* Centered Global Status Banner */}
          <div className="relative overflow-hidden bg-white border-2 border-dashed border-indigo-100 rounded-2xl p-8 text-center shadow-sm">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <BarChart3 className="w-24 h-24" />
            </div>
            <div className="flex flex-col items-center relative z-10">
              <div className="bg-indigo-50 p-4 rounded-full mb-4">
                <Info className="w-8 h-8 text-indigo-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">No scored leads yet</h3>
              <p className="text-sm text-gray-500 max-w-md mt-2 leading-relaxed">
                Leads will appear here once scoring rules are applied. Head over to the 
                <span className="font-semibold text-indigo-600 ml-1">Scoring Rules</span> tab to get started.
              </p>
            </div>
          </div>

          {/* Grid Layout: Balanced and Centered */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full items-start">
            <Card className="border-none shadow-md bg-white p-2">
               <div className="p-4 border-b border-gray-50 mb-2">
                 <h4 className="font-bold text-gray-800 uppercase text-xs tracking-widest">Lead Rankings</h4>
               </div>
               <TopScoredLeads />
            </Card>

            <Card className="border-none shadow-md bg-white p-2">
               <div className="p-4 border-b border-gray-50 mb-2">
                 <h4 className="font-bold text-gray-800 uppercase text-xs tracking-widest">Score Insights</h4>
               </div>
               <LeadScoreDistribution />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rules" className="outline-none">
          <Card className="border-none shadow-lg bg-white overflow-hidden">
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