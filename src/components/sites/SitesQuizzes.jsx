import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Edit, BarChart2, ChevronDown, ChevronUp, GripVertical, Check } from 'lucide-react';

const sampleQuizzes = [
  { id: '1', title: 'Lead Qualification Quiz', questions: 5, responses: 238, status: 'active' },
  { id: '2', title: 'Which Plan Is Right for You?', questions: 7, responses: 105, status: 'active' },
  { id: '3', title: 'Marketing Readiness Assessment', questions: 10, responses: 43, status: 'draft' },
];

const defaultQuestions = [
  {
    id: '1', text: 'How large is your team?', type: 'single',
    options: ['Just me', '2-10 people', '11-50 people', '50+ people']
  },
  {
    id: '2', text: "What's your primary marketing goal?", type: 'single',
    options: ['Generate more leads', 'Close more sales', 'Retain customers', 'Build brand awareness']
  },
  {
    id: '3', text: 'Which tools do you currently use? (select all that apply)', type: 'multi',
    options: ['Email marketing', 'CRM', 'Social media', 'Paid ads', 'SEO']
  },
];

export default function SitesQuizzes() {
  const [view, setView] = useState('list');
  const [questions, setQuestions] = useState(defaultQuestions);
  const [quizTitle, setQuizTitle] = useState('New Quiz');
  const [selectedQ, setSelectedQ] = useState(null);
  const [expandedQ, setExpandedQ] = useState('1');

  const addQuestion = () => {
    const newQ = { id: Date.now().toString(), text: 'New Question', type: 'single', options: ['Option A', 'Option B'] };
    setQuestions(prev => [...prev, newQ]);
    setExpandedQ(newQ.id);
  };

  const deleteQuestion = (id) => setQuestions(prev => prev.filter(q => q.id !== id));

  const updateOption = (qId, idx, val) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== qId) return q;
      const opts = [...q.options];
      opts[idx] = val;
      return { ...q, options: opts };
    }));
  };

  const addOption = (qId) => {
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, options: [...q.options, 'New Option'] } : q));
  };

  const removeOption = (qId, idx) => {
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, options: q.options.filter((_, i) => i !== idx) } : q));
  };

  if (view === 'list') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Quizzes</h2>
          <Button onClick={() => setView('builder')} className="bg-violet-600 hover:bg-violet-700 gap-2"><Plus className="w-4 h-4" />Create Quiz</Button>
        </div>
        <div className="grid gap-4">
          {sampleQuizzes.map(quiz => (
            <Card key={quiz.id} className="hover:shadow-md transition">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="font-semibold text-gray-900 mb-1">{quiz.title}</p>
                  <p className="text-sm text-gray-400">{quiz.questions} questions · {quiz.responses} responses</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={quiz.status === 'active' ? 'bg-green-100 text-green-700 border-0' : 'bg-gray-100 text-gray-600 border-0'}>{quiz.status}</Badge>
                  <Button size="sm" variant="outline" className="gap-1 text-xs"><BarChart2 className="w-3.5 h-3.5" />Results</Button>
                  <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => setView('builder')}><Edit className="w-3.5 h-3.5" />Edit</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setView('list')} className="text-gray-500">← Back</Button>
          <Input value={quizTitle} onChange={e => setQuizTitle(e.target.value)} className="h-8 font-semibold w-56 text-sm" />
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="text-xs">Save Draft</Button>
          <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-xs">Publish Quiz</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-3">
          {questions.map((q, idx) => (
            <div key={q.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)}
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-gray-300 cursor-grab" />
                  <span className="text-xs font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">Q{idx + 1}</span>
                  <p className="text-sm font-medium text-gray-800 truncate max-w-[300px]">{q.text}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{q.type === 'multi' ? 'Multi-select' : 'Single choice'}</Badge>
                  <button onClick={e => { e.stopPropagation(); deleteQuestion(q.id); }}><Trash2 className="w-4 h-4 text-gray-300 hover:text-red-400" /></button>
                  {expandedQ === q.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </div>
              {expandedQ === q.id && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Question Text</Label>
                    <Input value={q.text} onChange={e => setQuestions(prev => prev.map(qq => qq.id === q.id ? { ...qq, text: e.target.value } : qq))} className="text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500 block">Answer Options</Label>
                    {q.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className={`w-4 h-4 flex-shrink-0 border-2 border-gray-300 ${q.type === 'single' ? 'rounded-full' : 'rounded'}`} />
                        <Input value={opt} onChange={e => updateOption(q.id, i, e.target.value)} className="h-8 text-sm flex-1" />
                        <button onClick={() => removeOption(q.id, i)}><Trash2 className="w-3.5 h-3.5 text-gray-300 hover:text-red-400" /></button>
                      </div>
                    ))}
                    <button onClick={() => addOption(q.id)} className="text-xs text-violet-600 hover:text-violet-800 font-medium flex items-center gap-1">
                      <Plus className="w-3 h-3" />Add Option
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          <button onClick={addQuestion} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-violet-300 hover:text-violet-500 flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />Add Question
          </button>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <p className="font-semibold text-sm text-gray-800">Quiz Settings</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Show progress bar</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Show results at end</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Randomize questions</span>
                <input type="checkbox" className="rounded" />
              </div>
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">Redirect on complete</Label>
                <Input placeholder="https://yoursite.com/thanks" className="text-xs h-8" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="font-semibold text-sm text-gray-800">Lead Capture</p>
              <p className="text-xs text-gray-500">Collect contact info before showing results</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Request name</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Request email</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Request phone</span>
                <input type="checkbox" className="rounded" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}