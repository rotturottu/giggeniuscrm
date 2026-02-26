import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Star } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SurveyResponse() {
  const params = new URLSearchParams(window.location.search);
  const ticketId = params.get('ticket_id');
  const ticketNumber = params.get('ticket_number');
  const submitterEmail = params.get('email');
  const submitterName = params.get('name');
  const feedbackId = params.get('feedback_id');

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);

  useEffect(() => {
    if (feedbackId) {
      base44.entities.TicketFeedback.filter({ id: feedbackId }).then(records => {
        if (records[0]?.rating) setAlreadyDone(true);
      }).catch(() => {});
    }
  }, [feedbackId]);

  const handleSubmit = async () => {
    if (!rating) return;
    setSubmitting(true);
    await base44.entities.TicketFeedback.update(feedbackId, {
      rating,
      comment,
      responded_at: new Date().toISOString(),
    });
    await base44.entities.Ticket.update(ticketId, { satisfaction_rating: rating });
    setSubmitted(true);
    setSubmitting(false);
  };

  if (alreadyDone || submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-green-100 rounded-full">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank you!</h2>
          <p className="text-gray-500">Your feedback has been recorded. We appreciate you taking the time to help us improve.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6949094a978d5bae592b599f/645b25c34_GigGeniusLogo.png"
            alt="GigGenius"
            className="w-12 h-12 rounded-xl mx-auto mb-4"
          />
          <h2 className="text-xl font-bold text-gray-900">How did we do?</h2>
          <p className="text-sm text-gray-500 mt-1">
            Hi {submitterName}, your ticket <span className="font-mono font-bold text-blue-600">{ticketNumber}</span> has been resolved.
          </p>
          <p className="text-sm text-gray-500">We'd love your feedback on your support experience.</p>
        </div>

        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-10 h-10 ${(hovered || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
              />
            </button>
          ))}
        </div>

        {rating > 0 && (
          <p className="text-center text-sm font-semibold text-gray-700 mb-4">
            {['', 'Very Unsatisfied', 'Unsatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'][rating]}
          </p>
        )}

        <Textarea
          placeholder="Any additional comments? (optional)"
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={3}
          className="mb-4"
        />

        <Button
          onClick={handleSubmit}
          disabled={!rating || submitting}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90"
        >
          {submitting ? 'Submitting...' : 'Submit Feedback'}
        </Button>
      </div>
    </div>
  );
}