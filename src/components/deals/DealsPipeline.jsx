import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, DollarSign, Calendar, User, TrendingUp, BarChart3, Target, CheckCircle } from 'lucide-react';
import DealForm from './DealForm';
import DealDetailsDialog from './DealDetailsDialog';

const stages = [
  { id: 'prospecting', label: 'Prospecting', color: 'bg-gray-50 border-gray-200' },
  { id: 'qualification', label: 'Qualification', color: 'bg-blue-50 border-blue-200' },
  { id: 'proposal', label: 'Proposal', color: 'bg-purple-50 border-purple-200' },
  { id: 'negotiation', label: 'Negotiation', color: 'bg-yellow-50 border-yellow-200' },
  { id: 'closed_won', label: 'Closed Won', color: 'bg-green-50 border-green-200' },
  { id: 'closed_lost', label: 'Closed Lost', color: 'bg-red-50 border-red-200' },
];

export default function DealsPipeline() {
  const [showForm, setShowForm] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: deals = [] } = useQuery({
    queryKey: ['deals'],
    queryFn: () => base44.entities.Deal.list('-created_date'),
  });

  const updateStageMutation = useMutation({
    mutationFn: ({ id, stage }) => base44.entities.Deal.update(id, { stage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });

  const onDragEnd = (result) => {
    if (!result.destination) return;
    updateStageMutation.mutate({ id: result.draggableId, stage: result.destination.droppableId });
  };

  const getDealsByStage = (stageId) => deals.filter(deal => deal.stage === stageId);
  const calculateStageValue = (stageId) => getDealsByStage(stageId).reduce((sum, deal) => sum + (deal.value || 0), 0);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER & ACTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Deal Pipeline</h2>
          <p className="text-sm text-gray-500">Track and manage your sales opportunities</p>
        </div>
        <Button
          onClick={() => { setSelectedDeal(null); setShowForm(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all gap-2"
        >
          <Plus className="w-4 h-4" /> New Deal
        </Button>
      </div>

      {/* TOP STATS - Full Width Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center p-6">
              <div className="p-3 bg-blue-100 rounded-lg mr-4">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Pipeline Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(deals.reduce((sum, d) => sum + (d.value || 0), 0))}</p>
              </div>
            </div>
            <div className="h-1 bg-blue-600 w-full opacity-20" />
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center p-6">
              <div className="p-3 bg-purple-100 rounded-lg mr-4">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Deals</p>
                <p className="text-2xl font-bold text-gray-900">{deals.length}</p>
              </div>
            </div>
            <div className="h-1 bg-purple-600 w-full opacity-20" />
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center p-6">
              <div className="p-3 bg-green-100 rounded-lg mr-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Won (Monthly)</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(getDealsByStage('closed_won').reduce((sum, d) => sum + (d.value || 0), 0))}</p>
              </div>
            </div>
            <div className="h-1 bg-green-600 w-full opacity-20" />
          </CardContent>
        </Card>
      </div>

      {/* PIPELINE KANBAN */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="overflow-x-auto pb-6">
          <div className="flex gap-4 min-w-[1200px]">
            {stages.map((stage) => {
              const stageDeals = getDealsByStage(stage.id);
              return (
                <div key={stage.id} className="flex-1 flex flex-col min-w-[200px] bg-gray-50/50 rounded-xl p-2 border border-gray-100">
                  <div className={`p-3 rounded-t-lg border-b-2 mb-3 ${stage.color}`}>
                    <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700">{stage.label}</h3>
                    <div className="text-[10px] text-gray-500 mt-1 font-medium">
                      {stageDeals.length} DEALS • {formatCurrency(calculateStageValue(stage.id))}
                    </div>
                  </div>

                  <Droppable droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 space-y-3 p-1 rounded-lg transition-colors duration-200 ${
                          snapshot.isDraggingOver ? 'bg-indigo-50/50' : ''
                        }`}
                      >
                        {stageDeals.map((deal, index) => (
                          <Draggable key={deal.id} draggableId={deal.id} index={index}>
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`group border-none shadow-sm hover:shadow-md transition-all active:scale-95 ${
                                  snapshot.isDragging ? 'shadow-xl ring-2 ring-indigo-500 ring-offset-2' : ''
                                }`}
                                onClick={() => { setSelectedDeal(deal); setDetailsOpen(true); }}
                              >
                                <CardContent className="p-4">
                                  <div className="space-y-3">
                                    <p className="font-bold text-sm text-gray-900 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                                      {deal.name}
                                    </p>
                                    <div className="flex items-center text-indigo-600 font-extrabold">
                                      {formatCurrency(deal.value)}
                                    </div>
                                    <div className="pt-2 border-t border-gray-50 space-y-1">
                                      <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                        <User className="w-3 h-3" /> {deal.owner_email?.split('@')[0]}
                                      </div>
                                      {deal.expected_close_date && (
                                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                          <Calendar className="w-3 h-3" /> {new Date(deal.expected_close_date).toLocaleDateString()}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </div>
      </DragDropContext>

      <DealForm open={showForm} onClose={() => { setShowForm(false); setSelectedDeal(null); }} deal={selectedDeal} />
      <DealDetailsDialog 
        open={detailsOpen} 
        onClose={() => { setDetailsOpen(false); setSelectedDeal(null); }} 
        deal={selectedDeal}
        onEdit={(deal) => { setDetailsOpen(false); setSelectedDeal(deal); setShowForm(true); }}
      />
    </div>
  );
}