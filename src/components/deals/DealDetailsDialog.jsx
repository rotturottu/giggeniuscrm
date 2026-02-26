import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, DollarSign, Calendar, User, TrendingUp, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function DealDetailsDialog({ open, onClose, deal, onEdit }) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Deal.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      onClose();
    },
  });

  if (!deal) return null;

  const stageColors = {
    prospecting: 'bg-gray-100 text-gray-700',
    qualification: 'bg-blue-100 text-blue-700',
    proposal: 'bg-purple-100 text-purple-700',
    negotiation: 'bg-yellow-100 text-yellow-700',
    closed_won: 'bg-green-100 text-green-700',
    closed_lost: 'bg-red-100 text-red-700',
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{deal.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Badge className={stageColors[deal.stage]}>
              {deal.stage.replace('_', ' ').toUpperCase()}
            </Badge>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(deal.value)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {deal.probability && (
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-600">Win Probability</div>
                  <div className="font-semibold">{deal.probability}%</div>
                </div>
              </div>
            )}

            {deal.expected_close_date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-600">Expected Close</div>
                  <div className="font-semibold">
                    {new Date(deal.expected_close_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}

            {deal.owner_email && (
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-600">Deal Owner</div>
                  <div className="font-semibold">{deal.owner_email}</div>
                </div>
              </div>
            )}

            {deal.source && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-600">Source</div>
                  <div className="font-semibold">{deal.source}</div>
                </div>
              </div>
            )}
          </div>

          {deal.notes && (
            <div>
              <div className="text-sm text-gray-600 mb-2">Notes</div>
              <div className="p-3 bg-gray-50 rounded-lg text-sm">{deal.notes}</div>
            </div>
          )}

          {deal.lost_reason && (
            <div>
              <div className="text-sm text-gray-600 mb-2">Lost Reason</div>
              <div className="p-3 bg-red-50 rounded-lg text-sm text-red-700">{deal.lost_reason}</div>
            </div>
          )}

          <div className="flex justify-between gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                if (confirm('Delete this deal?')) {
                  deleteMutation.mutate(deal.id);
                }
              }}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={() => onEdit(deal)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Deal
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}