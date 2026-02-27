import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Frown, Meh, Smile, AlertTriangle, Copy, Check, RefreshCw } from 'lucide-react';

const SENTIMENT_CONFIG = {
  frustrated: {
    label: 'Frustrated',
    emoji: '😤',
    color: 'bg-red-100 text-red-700 border-red-200',
    dotColor: 'bg-red-500',
    icon: Frown,
    flag: true,
  },
  negative: {
    label: 'Negative',
    emoji: '😞',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    dotColor: 'bg-orange-400',
    icon: Frown,
    flag: false,
  },
  neutral: {
    label: 'Neutral',
    emoji: '😐',
    color: 'bg-gray-100 text-gray-600 border-gray-200',
    dotColor: 'bg-gray-400',
    icon: Meh,
    flag: false,
  },
  positive: {
    label: 'Positive',
    emoji: '😊',
    color: 'bg-green-100 text-green-700 border-green-200',
    dotColor: 'bg-green-500',
    icon: Smile,
    flag: false,
  },
};

export default function AITicketAssistant({ ticket, resolvedTickets = [], onApplySuggestion }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);

  useEffect(() => {
    runAnalysis();
  }, [ticket.id]);

  const runAnalysis = async () => {
    setLoading(true);
    setAnalysis(null);

    // Build context from past resolved tickets in the same category
    const pastResolutions = resolvedTickets
      .filter(t => t.category === ticket.category && t.resolution_notes && t.id !== ticket.id)
      .slice(0, 5)
      .map(t => `- Subject: "${t.subject}" → Resolution: "${t.resolution_notes}"`)
      .join('\n');

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a customer support AI assistant for GigGenius. Use this knowledge base when analyzing tickets and crafting responses:

=== GIGGENIUS KNOWLEDGE BASE ===

GigGenius is two platforms under the same founder (Hainz'el Llanely Cantos):
1. GigGenius Freelance Marketplace (gig-genius.io) — A secure, transparent freelance marketplace connecting businesses with verified freelancers.
2. GigGenius CRM — A powerful CRM sub-account (built on GHL) available FREE to active business owners who continue to use GigGenius Marketplace services.

MISSION: To empower freelancers and businesses with a secure, transparent, and equitable platform free from unfair fees, hidden costs, and fake job postings.

KEY DIFFERENTIATORS:
- GigGenius does NOT profit from connects, bids, or credits. Revenue comes solely from commissions on successfully completed projects.
- AI facial recognition + manual profile verification for every new user — dual-layer protection against scammers and fraud.
- No hidden ranking algorithms — profiles are NOT artificially boosted by spending.
- Free Credit System: Freelancers get automatic credit replenishment (credits returned on rejected applications or expired listings). Businesses get free job posting credits, replenished upon processing applicants.
- Active business owners using GigGenius Marketplace services are eligible for FREE GHL CRM sub-account access.
- The platform was rebuilt three times to get it right.

CORE VALUES: Transparency, Community First, Accessibility, Innovation, Trust & Security, Global Inclusion.

TEAM: Founded by Hainz'el Llanely Cantos. Development team includes Ezekiel D. Canlas, Daniella M. Simara, Von Gabriel E. Costuna, Lesly-Ann B. Victoria, Carlo R. Caburnay, John Richard L. Bercades, Nashrudin Maverick A. Esguerra, Niño Jandel C. Magpantay.

SUPPORT SCOPE: This ticketing system handles support for BOTH GigGenius Freelance Marketplace AND GigGenius CRM. Always clarify which platform the issue relates to when relevant.

=== END KNOWLEDGE BASE ===

Analyze this support ticket and provide:
1. Sentiment analysis of the customer's emotional state
2. 3 suggested response drafts the agent can use (varying in tone: empathetic, professional, concise)
3. A brief internal insight about what the customer really needs

Ticket Details:
- Ticket #: ${ticket.ticket_number}
- Category: ${ticket.category}
- Platform: ${ticket.platform}
- User Type: ${ticket.user_type}
- Subject: ${ticket.subject}
- Description: ${ticket.description}

${pastResolutions ? `Past resolved tickets in same category for context:\n${pastResolutions}` : ''}

Return a JSON with this exact structure:
{
  "sentiment": "frustrated" | "negative" | "neutral" | "positive",
  "sentiment_score": number between -1 and 1,
  "sentiment_reason": "1-2 sentence explanation of why",
  "should_flag": true if customer seems very frustrated or at-risk of churning,
  "flag_reason": "why this should be flagged (if applicable)",
  "insight": "1-2 sentences about what the customer really needs",
  "suggested_responses": [
    { "tone": "Empathetic", "subject": "email subject line", "body": "full response body" },
    { "tone": "Professional", "subject": "email subject line", "body": "full response body" },
    { "tone": "Concise", "subject": "email subject line", "body": "full response body" }
  ]
}`,
      response_json_schema: {
        type: 'object',
        properties: {
          sentiment: { type: 'string' },
          sentiment_score: { type: 'number' },
          sentiment_reason: { type: 'string' },
          should_flag: { type: 'boolean' },
          flag_reason: { type: 'string' },
          insight: { type: 'string' },
          suggested_responses: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                tone: { type: 'string' },
                subject: { type: 'string' },
                body: { type: 'string' },
              },
            },
          },
        },
      },
    });

    setAnalysis(result);
    setLoading(false);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = (suggestion) => {
    onApplySuggestion(suggestion.body);
    setSelectedSuggestion(suggestion.tone);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-xl">
            <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
          </div>
          <span className="font-semibold text-purple-800">AI is analyzing this ticket...</span>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-3 bg-purple-200/60 rounded-full animate-pulse`} style={{ width: `${90 - i * 15}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const sentimentCfg = SENTIMENT_CONFIG[analysis.sentiment] || SENTIMENT_CONFIG.neutral;
  const SentimentIcon = sentimentCfg.icon;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-100 rounded-lg">
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <span className="font-bold text-gray-800 text-sm">AI Assistant</span>
        </div>
        <Button variant="ghost" size="sm" onClick={runAnalysis} className="text-xs text-gray-500 h-7 px-2">
          <RefreshCw className="w-3 h-3 mr-1" /> Refresh
        </Button>
      </div>

      {/* Sentiment + Flag */}
      <div className={`border rounded-xl p-4 ${sentimentCfg.color}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{sentimentCfg.emoji}</span>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-sm">Customer Sentiment: {sentimentCfg.label}</p>
                {analysis.should_flag && (
                  <Badge className="bg-red-500 text-white text-xs gap-1 animate-pulse">
                    <AlertTriangle className="w-3 h-3" /> Auto-Flagged
                  </Badge>
                )}
              </div>
              <p className="text-xs mt-0.5 opacity-80">{analysis.sentiment_reason}</p>
              {analysis.should_flag && analysis.flag_reason && (
                <p className="text-xs mt-1 font-semibold text-red-700">⚠️ {analysis.flag_reason}</p>
              )}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs opacity-60">Score</p>
            <p className="font-black text-lg">{Math.round(analysis.sentiment_score * 100)}</p>
          </div>
        </div>
      </div>

      {/* AI Insight */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-blue-700 mb-1">💡 Agent Insight</p>
        <p className="text-sm text-blue-900">{analysis.insight}</p>
      </div>

      {/* Suggested Responses */}
      <div>
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Suggested Responses</p>
        <div className="space-y-3">
          {analysis.suggested_responses?.map((suggestion, i) => (
            <div key={i} className={`border rounded-xl p-4 transition-all ${selectedSuggestion === suggestion.tone ? 'border-purple-400 bg-purple-50' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-xs font-semibold text-purple-700 border-purple-300">
                  {suggestion.tone}
                </Badge>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-gray-500"
                    onClick={() => handleCopy(`Subject: ${suggestion.subject}\n\n${suggestion.body}`)}
                  >
                    {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                  </Button>
                  <Button
                    size="sm"
                    className="h-6 px-2 text-xs bg-purple-600 hover:bg-purple-700"
                    onClick={() => handleApply(suggestion)}
                  >
                    Use
                  </Button>
                </div>
              </div>
              <p className="text-xs font-semibold text-gray-700 mb-1">Subject: {suggestion.subject}</p>
              <p className="text-xs text-gray-600 whitespace-pre-line line-clamp-4">{suggestion.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}