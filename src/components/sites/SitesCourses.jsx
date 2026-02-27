import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Edit, Users, Play, Video, FileText, ChevronDown, ChevronRight, GripVertical, Lock } from 'lucide-react';

const sampleCourses = [
  { id: '1', title: 'Email Marketing Mastery', modules: 6, lessons: 28, students: 142, price: 297, status: 'published' },
  { id: '2', title: 'Sales Funnel Bootcamp', modules: 4, lessons: 18, students: 89, price: 0, status: 'published' },
  { id: '3', title: 'Social Media Strategy 2026', modules: 8, lessons: 35, students: 0, price: 197, status: 'draft' },
];

const defaultModules = [
  {
    id: '1', title: 'Getting Started', expanded: true, lessons: [
      { id: 'l1', title: 'Welcome & Overview', type: 'video', duration: '5:20', free: true },
      { id: 'l2', title: 'Setting Up Your Account', type: 'video', duration: '8:45', free: true },
    ]
  },
  {
    id: '2', title: 'Core Concepts', expanded: false, lessons: [
      { id: 'l3', title: 'Understanding Your Audience', type: 'video', duration: '12:10', free: false },
      { id: 'l4', title: 'Building Your First Campaign', type: 'video', duration: '18:30', free: false },
      { id: 'l5', title: 'Module 2 Worksheet', type: 'doc', duration: null, free: false },
    ]
  },
];

export default function SitesCourses() {
  const [view, setView] = useState('list');
  const [modules, setModules] = useState(defaultModules);
  const [courseTitle, setCourseTitle] = useState('New Course');
  const [selectedTab, setSelectedTab] = useState('curriculum');

  const toggleModule = (id) => {
    setModules(prev => prev.map(m => m.id === id ? { ...m, expanded: !m.expanded } : m));
  };

  const addModule = () => {
    setModules(prev => [...prev, { id: Date.now().toString(), title: 'New Module', expanded: true, lessons: [] }]);
  };

  const addLesson = (moduleId) => {
    setModules(prev => prev.map(m => m.id === moduleId ? {
      ...m, lessons: [...m.lessons, { id: Date.now().toString(), title: 'New Lesson', type: 'video', duration: '0:00', free: false }]
    } : m));
  };

  const deleteLesson = (moduleId, lessonId) => {
    setModules(prev => prev.map(m => m.id === moduleId ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) } : m));
  };

  if (view === 'list') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Courses</h2>
          <Button onClick={() => setView('builder')} className="bg-violet-600 hover:bg-violet-700 gap-2"><Plus className="w-4 h-4" />Create Course</Button>
        </div>
        <div className="grid gap-4">
          {sampleCourses.map(course => (
            <Card key={course.id} className="hover:shadow-md transition">
              <CardContent className="flex items-center gap-6 p-5">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center text-2xl">🎓</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900">{course.title}</p>
                    <Badge className={course.status === 'published' ? 'bg-green-100 text-green-700 border-0' : 'bg-gray-100 text-gray-600 border-0'}>{course.status}</Badge>
                    {course.price === 0 ? <Badge className="bg-blue-100 text-blue-700 border-0">Free</Badge> : <Badge className="bg-violet-100 text-violet-700 border-0">${course.price}</Badge>}
                  </div>
                  <p className="text-sm text-gray-400">{course.modules} modules · {course.lessons} lessons · {course.students} students enrolled</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1 text-xs"><Users className="w-3.5 h-3.5" />Students</Button>
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
          <Input value={courseTitle} onChange={e => setCourseTitle(e.target.value)} className="h-8 font-semibold w-64 text-sm" />
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="text-xs">Save Draft</Button>
          <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-xs">Publish Course</Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="curriculum">📚 Curriculum</TabsTrigger>
          <TabsTrigger value="settings">⚙️ Settings</TabsTrigger>
          <TabsTrigger value="pricing">💰 Pricing</TabsTrigger>
          <TabsTrigger value="students"><Users className="w-3.5 h-3.5 mr-1" />Students</TabsTrigger>
        </TabsList>

        <TabsContent value="curriculum" className="mt-4">
          <div className="space-y-3">
            {modules.map((mod, mIdx) => (
              <div key={mod.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100" onClick={() => toggleModule(mod.id)}>
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-4 h-4 text-gray-300 cursor-grab" />
                    <span className="text-xs font-bold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">Module {mIdx + 1}</span>
                    <p className="font-medium text-gray-800 text-sm">{mod.title}</p>
                    <span className="text-xs text-gray-400">{mod.lessons.length} lessons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {mod.expanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>
                {mod.expanded && (
                  <div className="divide-y divide-gray-50">
                    {mod.lessons.map((lesson) => (
                      <div key={lesson.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 group">
                        <GripVertical className="w-3.5 h-3.5 text-gray-200 cursor-grab" />
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                          {lesson.type === 'video' ? <Play className="w-3 h-3 text-indigo-500 fill-indigo-500" /> : <FileText className="w-3 h-3 text-indigo-500" />}
                        </div>
                        <p className="text-sm text-gray-700 flex-1">{lesson.title}</p>
                        <div className="flex items-center gap-3">
                          {lesson.free && <Badge className="bg-green-50 text-green-600 border-green-200 text-xs">Free Preview</Badge>}
                          {lesson.type === 'video' && <span className="text-xs text-gray-400">{lesson.duration}</span>}
                          {!lesson.free && <Lock className="w-3.5 h-3.5 text-gray-300" />}
                          <button onClick={() => deleteLesson(mod.id, lesson.id)} className="opacity-0 group-hover:opacity-100 transition"><Trash2 className="w-3.5 h-3.5 text-gray-300 hover:text-red-400" /></button>
                        </div>
                      </div>
                    ))}
                    <div className="px-5 py-2.5">
                      <button onClick={() => addLesson(mod.id)} className="text-xs text-violet-600 hover:text-violet-800 font-medium flex items-center gap-1">
                        <Plus className="w-3 h-3" />Add Lesson
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <button onClick={addModule} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-violet-300 hover:text-violet-500 flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />Add Module
            </button>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <div className="grid grid-cols-2 gap-6">
            <Card><CardContent className="p-5 space-y-4">
              <p className="font-semibold text-gray-800">Course Info</p>
              <div><Label className="text-xs text-gray-500 mb-1 block">Title</Label><Input defaultValue={courseTitle} className="text-sm" /></div>
              <div><Label className="text-xs text-gray-500 mb-1 block">Subtitle</Label><Input placeholder="Short description..." className="text-sm" /></div>
              <div><Label className="text-xs text-gray-500 mb-1 block">Description</Label><textarea className="w-full border border-gray-200 rounded-lg text-sm px-3 py-2 h-24 resize-none focus:outline-none" placeholder="Describe your course..." /></div>
              <div><Label className="text-xs text-gray-500 mb-1 block">Thumbnail</Label><div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center text-sm text-gray-400 cursor-pointer hover:border-violet-300">Upload Thumbnail</div></div>
            </CardContent></Card>
            <Card><CardContent className="p-5 space-y-4">
              <p className="font-semibold text-gray-800">Access Settings</p>
              {[
                { label: 'Drip content by schedule', sub: 'Release lessons over time' },
                { label: 'Certificate of completion', sub: 'Award certificate when done' },
                { label: 'Discussion per lesson', sub: 'Enable comments on each lesson' },
                { label: 'Download resources', sub: 'Allow PDF/resource downloads' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-gray-500">{item.sub}</p></div>
                  <Switch defaultChecked={i === 1} />
                </div>
              ))}
            </CardContent></Card>
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="mt-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { type: 'Free', desc: 'No payment required', icon: '🎁' },
              { type: 'One-Time', desc: 'Single payment access', icon: '💳' },
              { type: 'Subscription', desc: 'Recurring monthly fee', icon: '🔄' },
            ].map((opt, i) => (
              <Card key={i} className={`cursor-pointer hover:shadow-md transition border-2 ${i === 1 ? 'border-violet-500' : 'border-gray-200'}`}>
                <CardContent className="p-5 text-center">
                  <p className="text-3xl mb-3">{opt.icon}</p>
                  <p className="font-bold text-gray-900 mb-1">{opt.type}</p>
                  <p className="text-xs text-gray-500 mb-4">{opt.desc}</p>
                  {i === 1 && (
                    <div><Label className="text-xs text-gray-500 mb-1 block">Price (USD)</Label><Input defaultValue="297" className="text-center font-bold text-lg" /></div>
                  )}
                  {i === 2 && (
                    <div><Label className="text-xs text-gray-500 mb-1 block">Monthly Price</Label><Input defaultValue="47" className="text-center" /></div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="students" className="mt-4">
          <div className="flex justify-between mb-4">
            <Input placeholder="Search students..." className="max-w-xs h-9" />
            <Button className="bg-violet-600 hover:bg-violet-700 text-sm gap-2"><Plus className="w-4 h-4" />Enroll Student</Button>
          </div>
          <Card><CardContent className="p-0">
            {[
              { name: 'Alice Johnson', email: 'alice@example.com', progress: 75, enrolled: 'Jan 15, 2026' },
              { name: 'Bob Smith', email: 'bob@example.com', progress: 40, enrolled: 'Feb 1, 2026' },
              { name: 'Carol Davis', email: 'carol@example.com', progress: 100, enrolled: 'Dec 10, 2025' },
            ].map((s, i) => (
              <div key={i} className={`flex items-center gap-4 px-5 py-4 ${i < 2 ? 'border-b' : ''}`}>
                <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center font-bold text-violet-700 text-sm">{s.name[0]}</div>
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-900">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.email} · Enrolled {s.enrolled}</p>
                </div>
                <div className="w-32">
                  <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Progress</span><span>{s.progress}%</span></div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${s.progress === 100 ? 'bg-green-500' : 'bg-violet-500'}`} style={{ width: `${s.progress}%` }} />
                  </div>
                </div>
                {s.progress === 100 && <Badge className="bg-green-100 text-green-700 border-0">Completed</Badge>}
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}