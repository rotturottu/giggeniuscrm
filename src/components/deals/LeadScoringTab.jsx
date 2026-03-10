import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
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
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <Tabs defaultValue="overview" className="w-full">
        {/* Centered Tabs List */}
        <div className="flex justify-center mb-8">
          <TabsList className="bg-gray-100/80 p-1">
            <TabsTrigger value="overview" className="px-8">Overview</TabsTrigger>
            <TabsTrigger value="rules" className="px-8">Scoring Rules</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-8 outline-none">
          {/* Centered Large Info Banner */}
          <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-2xl bg-white/50 w-full text-center">
            <div className="bg-gray-100 p-5 rounded-full mb-4">
               <BarChart3 className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">No scored leads yet</h3>
            <p className="text-sm text-gray-500 max-w-sm mt-2">
              Once you set up your scoring rules, your lead rankings and distribution charts will appear here automatically.
            </p>
          </div>

          {/* Balanced Grid for Charts and Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
            <div className="w-full">
              <TopScoredLeads />
            </div>
            <div className="w-full">
              <LeadScoreDistribution />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="rules" className="outline-none">
          <Card className="border-none shadow-sm bg-white overflow-hidden">
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