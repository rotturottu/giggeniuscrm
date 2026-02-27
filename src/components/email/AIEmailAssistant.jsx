import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Copy, RefreshCw, Sparkles, Wand2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function AIEmailAssistant({ onApplySuggestion }) {
  const [campaignGoal, setCampaignGoal] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [generating, setGenerating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [currentContent, setCurrentContent] = useState('');

  const availableTokens = [
    '{{first_name}}',
    '{{last_name}}',
    '{{company}}',
    '{{email}}',
    '{{phone}}',
    '{{source}}',
    '{{custom_field}}',
  ];

  const generateContent = async () => {
    if (!campaignGoal || !targetAudience) {
      toast.error('Please provide campaign goal and target audience');
      return;
    }

    setGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert email marketer. Generate high-converting email content for the following campaign:

Campaign Goal: ${campaignGoal}
Target Audience: ${targetAudience}

Generate:
1. 3 compelling subject line options (keep under 50 characters)
2. Email body content (150-200 words) that is engaging and action-oriented
3. A strong call-to-action

Use personalization tokens like {{first_name}}, {{company}} where appropriate.
Format the response as JSON.`,
        response_json_schema: {
          type: 'object',
          properties: {
            subject_lines: {
              type: 'array',
              items: { type: 'string' },
              description: '3 subject line options',
            },
            body: {
              type: 'string',
              description: 'Email body content',
            },
            cta: {
              type: 'string',
              description: 'Call to action',
            },
          },
        },
      });

      setSuggestions(response);
      toast.success('Content generated successfully!');
    } catch (error) {
      toast.error('Failed to generate content: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const analyzeContent = async (content) => {
    if (!content || content.length < 20) {
      toast.error('Please provide content to analyze');
      return;
    }

    setAnalyzing(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an email deliverability and engagement expert. Analyze this email content for effectiveness:

${content}

Provide:
1. Deliverability score (0-100) - check for spam triggers
2. Engagement potential (0-100) - assess readability and compelling nature
3. 3-5 specific improvement suggestions
4. Suggested personalization opportunities

Format as JSON.`,
        response_json_schema: {
          type: 'object',
          properties: {
            deliverability_score: { type: 'number' },
            engagement_score: { type: 'number' },
            improvements: {
              type: 'array',
              items: { type: 'string' },
            },
            personalization_suggestions: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
      });

      return response;
    } catch (error) {
      toast.error('Failed to analyze content: ' + error.message);
      return null;
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAnalyze = async () => {
    const analysis = await analyzeContent(currentContent);
    if (analysis) {
      setSuggestions({ ...suggestions, analysis });
      toast.success('Analysis complete!');
    }
  };

  const copyToken = (token) => {
    navigator.clipboard.writeText(token);
    toast.success(`Copied ${token}`);
  };

  return (
    <div className="space-y-4">
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Email Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-semibold">Campaign Goal</Label>
            <Input
              placeholder="e.g., Generate leads for new product launch"
              value={campaignGoal}
              onChange={(e) => setCampaignGoal(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm font-semibold">Target Audience</Label>
            <Input
              placeholder="e.g., B2B SaaS decision makers, tech companies"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="mt-1"
            />
          </div>

          <Button
            onClick={generateContent}
            disabled={generating}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {generating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Content with AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {suggestions && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-lg">AI Suggestions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {suggestions.subject_lines && (
              <div>
                <Label className="text-sm font-semibold mb-2 block">Subject Line Options</Label>
                <div className="space-y-2">
                  {suggestions.subject_lines.map((subject, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 text-sm">{subject}</div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          onApplySuggestion('subject', subject);
                          toast.success('Subject line applied!');
                        }}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {suggestions.body && (
              <div>
                <Label className="text-sm font-semibold mb-2 block">Email Body</Label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm whitespace-pre-wrap mb-2">{suggestions.body}</div>
                  <Button
                    size="sm"
                    onClick={() => {
                      onApplySuggestion('body', suggestions.body);
                      toast.success('Body content applied!');
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Apply Body
                  </Button>
                </div>
              </div>
            )}

            {suggestions.cta && (
              <div>
                <Label className="text-sm font-semibold mb-2 block">Call to Action</Label>
                <Badge className="text-sm p-2">{suggestions.cta}</Badge>
              </div>
            )}

            {suggestions.analysis && (
              <div className="border-t pt-4">
                <Label className="text-sm font-semibold mb-3 block">Content Analysis</Label>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">Deliverability Score</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {suggestions.analysis.deliverability_score}/100
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">Engagement Score</div>
                    <div className="text-2xl font-bold text-green-600">
                      {suggestions.analysis.engagement_score}/100
                    </div>
                  </div>
                </div>

                {suggestions.analysis.improvements && (
                  <div className="mb-3">
                    <div className="text-xs font-semibold text-gray-700 mb-2">Improvements</div>
                    <ul className="space-y-1">
                      {suggestions.analysis.improvements.map((imp, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-purple-600">•</span>
                          {imp}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {suggestions.analysis.personalization_suggestions && (
                  <div>
                    <div className="text-xs font-semibold text-gray-700 mb-2">Personalization Ideas</div>
                    <ul className="space-y-1">
                      {suggestions.analysis.personalization_suggestions.map((sug, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-pink-600">•</span>
                          {sug}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-lg">Personalization Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {availableTokens.map((token) => (
              <Badge
                key={token}
                variant="outline"
                className="cursor-pointer hover:bg-purple-100"
                onClick={() => copyToken(token)}
              >
                {token}
                <Copy className="w-3 h-3 ml-1" />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-lg">Analyze Existing Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="Paste your email content here to analyze..."
            value={currentContent}
            onChange={(e) => setCurrentContent(e.target.value)}
            className="min-h-[100px]"
          />
          <Button
            onClick={handleAnalyze}
            disabled={analyzing || !currentContent}
            variant="outline"
            className="w-full"
          >
            {analyzing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze with AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}