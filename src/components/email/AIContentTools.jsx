import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    CheckCircle2,
    ChevronDown, ChevronUp,
    Copy,
    MessageSquare,
    RefreshCw,
    Sliders,
    Sparkles,
    UserCheck,
    Wand2
} from 'lucide-react';
import { useState } from 'react';

const TONES = ['Professional', 'Friendly', 'Urgent', 'Casual', 'Empathetic', 'Authoritative', 'Playful', 'Minimalist'];

const TOKENS = [
  { token: '{{first_name}}', desc: 'First name' },
  { token: '{{last_name}}', desc: 'Last name' },
  { token: '{{company}}', desc: 'Company name' },
  { token: '{{email}}', desc: 'Email address' },
  { token: '{{phone}}', desc: 'Phone number' },
  { token: '{{source}}', desc: 'Lead source' },
  { token: '{{opportunity_stage}}', desc: 'Deal stage' },
  { token: '{{opportunity_value}}', desc: 'Deal value' },
];

function Section({ icon: Icon, title, color = 'purple', children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const colorMap = {
    purple: 'text-purple-600 bg-purple-50 border-purple-200',
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    pink: 'text-pink-600 bg-pink-50 border-pink-200',
    green: 'text-green-600 bg-green-50 border-green-200',
  };
  return (
    <div className={`border rounded-xl overflow-hidden ${colorMap[color].split(' ')[2]}`}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold ${colorMap[color].split(' ').slice(0, 2).join(' ')} hover:opacity-90 transition`}
      >
        <span className="flex items-center gap-2"><Icon className="w-4 h-4" />{title}</span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && <div className="bg-white px-4 py-4 space-y-3">{children}</div>}
    </div>
  );
}

// ── 1. Subject Line Generator ────────────────────────────────────────────────
function SubjectGenerator({ onApply }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert email marketer. Generate 5 compelling email subject lines for the following context:\n\n${prompt}\n\nRules: under 60 chars, varied styles (question, number, urgency, personalised, curiosity). Use {{first_name}} in at least one.`,
      response_json_schema: { type: 'object', properties: { subjects: { type: 'array', items: { type: 'string' } } } },
    });
    setSubjects(res.subjects || []);
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      <Textarea placeholder="Describe your email goal, audience, and product…" value={prompt} onChange={e => setPrompt(e.target.value)} rows={2} className="text-sm" />
      <Button size="sm" onClick={generate} disabled={loading || !prompt.trim()} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
        {loading ? <><RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />Generating…</> : <><Sparkles className="w-3.5 h-3.5 mr-1.5" />Generate Subject Lines</>}
      </Button>
      {subjects.map((s, i) => (
        <div key={i} className="flex items-center gap-2 p-2.5 bg-purple-50 rounded-lg group">
          <span className="flex-1 text-sm">{s}</span>
          <span className="text-xs text-gray-400">{s.length}ch</span>
          <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 h-7 px-2 text-purple-700 hover:bg-purple-100" onClick={() => onApply('subject', s)}>
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />Use
          </Button>
        </div>
      ))}
    </div>
  );
}

// ── 2. Body Writer ───────────────────────────────────────────────────────────
function BodyWriter({ onApply }) {
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('Professional');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Write a ${tone.toLowerCase()} marketing email body based on this brief:\n\n${prompt}\n\nRequirements:\n- 120-180 words\n- Use {{first_name}} for personalisation\n- Include a clear call-to-action at the end\n- No subject line, just the body\n- Plain text, no markdown`,
      response_json_schema: { type: 'object', properties: { body: { type: 'string' }, cta: { type: 'string' } } },
    });
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-2">
          <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Brief / Prompt</Label>
          <Textarea placeholder="e.g., Promote our new CRM feature to existing customers, highlight time-saving and easy migration." value={prompt} onChange={e => setPrompt(e.target.value)} rows={3} className="text-sm" />
        </div>
        <div>
          <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Tone</Label>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>{TONES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <Button size="sm" onClick={generate} disabled={loading || !prompt.trim()} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
        {loading ? <><RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />Writing…</> : <><Wand2 className="w-3.5 h-3.5 mr-1.5" />Write Email Body</>}
      </Button>
      {result?.body && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 flex items-center justify-between">
            <span>Generated Body</span>
            <Button size="sm" variant="ghost" className="h-6 px-2 text-blue-700 hover:bg-blue-100" onClick={() => onApply('body', result.body)}>
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />Apply
            </Button>
          </div>
          <div className="p-3 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{result.body}</div>
          {result.cta && (
            <div className="px-3 pb-3">
              <span className="text-xs font-semibold text-gray-500">Suggested CTA: </span>
              <Badge variant="outline" className="text-xs ml-1 cursor-pointer" onClick={() => onApply('cta', result.cta)}>{result.cta}</Badge>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── 3. Personalization Token Suggestions ─────────────────────────────────────
function PersonalizationSuggester({ currentBody, onInsertToken }) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [copied, setCopied] = useState(null);

  const getSuggestions = async () => {
    setLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this email body and suggest the best personalization tokens to increase engagement. For each suggestion, explain WHERE in the email to use it and WHY it helps:\n\n${currentBody || '(No body yet — suggest general best practices for email personalisation)'}\n\nAvailable tokens: ${TOKENS.map(t => t.token).join(', ')}`,
      response_json_schema: {
        type: 'object',
        properties: {
          suggestions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                token: { type: 'string' },
                reason: { type: 'string' },
                example: { type: 'string' },
              }
            }
          }
        }
      },
    });
    setSuggestions(res.suggestions || []);
    setLoading(false);
  };

  const copyToken = (token) => {
    navigator.clipboard.writeText(token);
    setCopied(token);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs text-gray-500 mb-2">Quick-copy any token into your email body:</p>
        <div className="flex flex-wrap gap-1.5">
          {TOKENS.map(({ token, desc }) => (
            <button key={token} onClick={() => { onInsertToken(token); copyToken(token); }}
              className={`px-2 py-1 rounded-md text-xs font-mono border transition-colors ${copied === token ? 'bg-green-100 border-green-400 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-pink-50 hover:border-pink-300 hover:text-pink-700'}`}
            >
              {copied === token ? <CheckCircle2 className="w-3 h-3 inline mr-1" /> : <Copy className="w-3 h-3 inline mr-1" />}
              {token}
            </button>
          ))}
        </div>
      </div>
      <Button size="sm" variant="outline" onClick={getSuggestions} disabled={loading} className="w-full border-pink-300 text-pink-700 hover:bg-pink-50">
        {loading ? <><RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />Analyzing…</> : <><Sparkles className="w-3.5 h-3.5 mr-1.5" />AI: Suggest Tokens for My Content</>}
      </Button>
      {suggestions.map((s, i) => (
        <div key={i} className="p-3 bg-pink-50 rounded-lg text-sm border border-pink-100">
          <div className="flex items-center gap-2 mb-1">
            <code className="bg-white border border-pink-200 px-1.5 py-0.5 rounded text-xs text-pink-700 font-mono">{s.token}</code>
            <button onClick={() => onInsertToken(s.token)} className="text-xs text-pink-600 underline hover:text-pink-800">Insert</button>
          </div>
          <p className="text-xs text-gray-600">{s.reason}</p>
          {s.example && <p className="text-xs text-gray-400 italic mt-0.5">e.g. "{s.example}"</p>}
        </div>
      ))}
    </div>
  );
}

// ── 4. Tone Adjuster ─────────────────────────────────────────────────────────
function ToneAdjuster({ currentBody, currentSubject, onApply }) {
  const [targetTone, setTargetTone] = useState('Friendly');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const adjust = async () => {
    if (!currentBody && !currentSubject) return;
    setLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Rewrite the following email content with a ${targetTone.toLowerCase()} tone. Keep the same core message, personalization tokens (e.g. {{first_name}}), and structure — only adjust the language and tone.\n\n${currentSubject ? `SUBJECT: ${currentSubject}\n\n` : ''}BODY:\n${currentBody || '(no body yet)'}`,
      response_json_schema: {
        type: 'object',
        properties: {
          subject: { type: 'string' },
          body: { type: 'string' },
          tone_notes: { type: 'string' },
        }
      },
    });
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      {(!currentBody && !currentSubject) && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">Write your email content first (step above), then use tone adjustment.</p>
      )}
      <div>
        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Target Tone</Label>
        <div className="flex flex-wrap gap-1.5">
          {TONES.map(t => (
            <button key={t} onClick={() => setTargetTone(t)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${targetTone === t ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <Button size="sm" onClick={adjust} disabled={loading || (!currentBody && !currentSubject)} className="w-full bg-green-600 hover:bg-green-700 text-white">
        {loading ? <><RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />Adjusting…</> : <><Sliders className="w-3.5 h-3.5 mr-1.5" />Adjust Tone to {targetTone}</>}
      </Button>
      {result && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 flex items-center justify-between">
            <span>{targetTone} rewrite</span>
            <div className="flex gap-1.5">
              {result.subject && <Button size="sm" variant="ghost" className="h-6 px-2 text-green-700 hover:bg-green-100" onClick={() => onApply('subject', result.subject)}>Apply Subject</Button>}
              {result.body && <Button size="sm" variant="ghost" className="h-6 px-2 text-green-700 hover:bg-green-100" onClick={() => onApply('body', result.body)}>Apply Body</Button>}
            </div>
          </div>
          {result.subject && <div className="px-3 pt-3 text-xs text-gray-500 font-semibold">Subject: <span className="font-normal text-gray-800">{result.subject}</span></div>}
          {result.body && <div className="p-3 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{result.body}</div>}
          {result.tone_notes && <div className="px-3 pb-3 text-xs text-green-600 italic">{result.tone_notes}</div>}
        </div>
      )}
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function AIContentTools({ currentSubject, currentBody, onApply, onInsertToken }) {
  return (
    <div className="space-y-2 mt-4">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-4 h-4 text-purple-600" />
        <span className="text-sm font-semibold text-purple-700">AI Writing Tools</span>
        <Badge variant="secondary" className="text-xs">4 tools</Badge>
      </div>

      <Section icon={MessageSquare} title="Subject Line Generator" color="purple" defaultOpen>
        <SubjectGenerator onApply={onApply} />
      </Section>

      <Section icon={Wand2} title="AI Email Body Writer" color="blue">
        <BodyWriter onApply={onApply} />
      </Section>

      <Section icon={UserCheck} title="Personalization Tokens" color="pink">
        <PersonalizationSuggester currentBody={currentBody} onInsertToken={onInsertToken} />
      </Section>

      <Section icon={Sliders} title="Tone Adjustment" color="green">
        <ToneAdjuster currentBody={currentBody} currentSubject={currentSubject} onApply={onApply} />
      </Section>
    </div>
  );
}