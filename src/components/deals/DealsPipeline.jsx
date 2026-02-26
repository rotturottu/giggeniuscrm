import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, DollarSign, Calendar, User, TrendingUp } from 'lucide-react';
import DealForm from './DealForm';
import DealDetailsDialog from './DealDetailsDialog';

const stages = [
  { id: 'prospecting', label: 'Prospecting', color: 'bg-gray-100 border-gray-300' },
  { id: 'qualification', label: 'Qualification', color: 'bg-blue-100 border-blue-300' },
  { id: 'proposal', label: 'Proposal', color: 'bg-purple-100 border-purple-300' },
  { id: 'negotiation', label: 'Negotiation', color: 'bg-yellow-100 border-yellow-300' },
  { id: 'closed_won', label: 'Closed Won', color: 'bg-green-100 border-green-300' },
  { id: 'closed_lost', label: 'Closed Lost', color: 'bg-red-100 border-red-300' },
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

    const dealId = result.draggableId;
    const newStage = result.destination.droppableId;

    updateStageMutation.mutate({ id: dealId, stage: newStage });
  };

  const getDealsByStage = (stageId) => {
    return deals.filter(deal => deal.stage === stageId);
  };

  const calculateStageValue = (stageId) => {
    return getDealsByStage(stageId).reduce((sum, deal) => sum + (deal.value || 0), 0);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="text-sm text-gray-600 mb-1">Total Pipeline Value</div>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(deals.reduce((sum, d) => sum + (d.value || 0), 0))}
              </div>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="text-sm text-gray-600 mb-1">Total Deals</div>
              <div className="text-2xl font-bold text-purple-600">{deals.length}</div>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="text-sm text-gray-600 mb-1">Won This Month</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(getDealsByStage('closed_won').reduce((sum, d) => sum + (d.value || 0), 0))}
              </div>
            </CardContent>
          </Card>
        </div>
        <Button
          onClick={() => {
            setSelectedDeal(null);
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Deal
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-6 gap-4">
          {stages.map((stage) => {
            const stageDeals = getDealsByStage(stage.id);
            const stageValue = calculateStageValue(stage.id);

            return (
              <div key={stage.id} className="space-y-3">
                <div className={`p-3 rounded-lg border-2 ${stage.color}`}>
                  <h3 className="font-semibold text-sm mb-1">{stage.label}</h3>
                  <div className="text-xs text-gray-600">
                    {stageDeals.length} deals • {formatCurrency(stageValue)}
                  </div>
                </div>

                <Droppable droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-2 min-h-[200px] p-2 rounded-lg border-2 border-dashed ${
                        snapshot.isDraggingOver ? 'bg-blue-50 border-blue-300' : 'border-gray-200'
                      }`}
                    >
                      {stageDeals.map((deal, index) => (
                        <Draggable key={deal.id} draggableId={deal.id} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`cursor-pointer hover:shadow-lg transition-all ${
                                snapshot.isDragging ? 'shadow-xl rotate-2' : ''
                              }`}
                              onClick={() => {
                                setSelectedDeal(deal);
                                setDetailsOpen(true);
                              }}
                            >
                              <CardContent className="p-3">
                                <div className="space-y-2">
                                  <div className="font-semibold text-sm line-clamp-2">{deal.name}</div>
                                  <div className="flex items-center gap-1 text-lg font-bold text-green-600">
                                    <DollarSign className="w-4 h-4" />
                                    {formatCurrency(deal.value)}
                                  </div>
                                  {deal.probability && (
                                    <div className="flex items-center gap-1 text-xs text-gray-600">
                                      <TrendingUp className="w-3 h-3" />
                                      {deal.probability}% probability
                                    </div>
                                  )}
                                  {deal.expected_close_date && (
                                    <div className="flex items-center gap-1 text-xs text-gray-600">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(deal.expected_close_date).toLocaleDateString()}
                                    </div>
                                  )}
                                  {deal.owner_email && (
                                    <div className="flex items-center gap-1 text-xs text-gray-600">
                                      <User className="w-3 h-3" />
                                      {deal.owner_email.split('@')[0]}
                                    </div>
                                  )}
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
      </DragDropContext>

      <DealForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedDeal(null);
        }}
        deal={selectedDeal}
      />

      <DealDetailsDialog
        open={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedDeal(null);
        }}
        deal={selectedDeal}
        onEdit={(deal) => {
          setDetailsOpen(false);
          setSelectedDeal(deal);
          setShowForm(true);
        }}
      />
    </div>
  );
}