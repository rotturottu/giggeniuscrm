import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Mail, Building2, TrendingUp } from 'lucide-react';

export default function TopScoredLeads() {
  const { data: leads = [] } = useQuery({
    queryKey: ['top-scored-leads'],
    queryFn: async () => {
      const allLeads = await base44.entities.Lead.filter({});
      return allLeads
        .filter(lead => lead.score > 0)
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 20);
    },
  });

  const getGradeColor = (grade) => {
    const colors = {
      A: 'bg-green-100 text-green-700 border-green-300',
      B: 'bg-blue-100 text-blue-700 border-blue-300',
      C: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      D: 'bg-orange-100 text-orange-700 border-orange-300',
      F: 'bg-red-100 text-red-700 border-red-300',
    };
    return colors[grade] || colors.F;
  };

  if (leads.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No scored leads yet. Leads will appear here once scoring rules are applied.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {leads.map((lead, index) => (
        <Card key={lead.id} className="border-2 hover:border-blue-300 transition-all">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                {index < 3 && (
                  <div className={`p-2 rounded-full ${
                    index === 0 ? 'bg-yellow-100' : index === 1 ? 'bg-gray-100' : 'bg-orange-100'
                  }`}>
                    <Trophy className={`w-5 h-5 ${
                      index === 0 ? 'text-yellow-600' : index === 1 ? 'text-gray-600' : 'text-orange-600'
                    }`} />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{lead.name}</h3>
                    <Badge className={getGradeColor(lead.score_grade)}>
                      Grade {lead.score_grade || 'N/A'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {lead.email}
                    </div>
                    {lead.company && (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        {lead.company}
                      </div>
                    )}
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="outline">{lead.status}</Badge>
                    {lead.source && <Badge variant="outline">{lead.source}</Badge>}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span className="text-3xl font-bold text-blue-600">{lead.score}</span>
                </div>
                <span className="text-xs text-gray-500">Score</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}