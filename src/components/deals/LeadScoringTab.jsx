import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    <div className="space-y-6">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rules">Scoring Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopScoredLeads />
            <LeadScoreDistribution />
          </div>
        </TabsContent>

        <TabsContent value="rules">
          <ScoringRulesList onEdit={handleEdit} onCreateNew={() => setShowRuleBuilder(true)} />
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