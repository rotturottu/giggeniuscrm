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

  // Fetch leads to check if we should show the empty state or the dashboard
  const { data: leads = [] } = useQuery({
    queryKey: ['scored-leads'],
    queryFn: () => base44.entities.Lead.list('-score', 10),
  });

  const hasLeads = leads.length > 0;

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
        <div className="flex items-center justify-between mb-6">
          <TabsList className="bg-gray-100/80 p-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="rules">Scoring Rules</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6 outline-none">
          {!hasLeads ? (
            /* 1. CLEAN EMPTY STATE - Only shows when no data exists */
            <div className="flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed border-gray-200 rounded-2xl bg-white/50">
              <div className="bg-gray-100 p-5 rounded-full mb-4">
                 <BarChart3 className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">No scored leads yet</h3>
              <p className="text-sm text-gray-500 text-center max-w-sm mt-2">
                Once you set up your scoring rules, your lead rankings and distribution charts will appear here automatically.
              </p>
            </div>
          ) : (
            /* 2. FULL DASHBOARD - Shows when leads exist */
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
              <div className="space-y-6">
                <TopScoredLeads />
              </div>
              <div className="space-y-6">
                <LeadScoreDistribution />
              </div>
            </div>
          )}
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