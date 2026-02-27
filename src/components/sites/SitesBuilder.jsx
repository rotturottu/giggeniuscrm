import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Plus, Trash2, Eye, Save, Smartphone, Monitor, Tablet, Settings,
  Type, Image, Square, Layout, AlignLeft, Video, Minus, Columns,
  Star, ChevronRight, MoreHorizontal, ArrowUp, ArrowDown, Copy,
  Globe, Layers, Zap, MousePointer, Grid
} from 'lucide-react';

const SECTIONS = [
  { id: 'hero', label: 'Hero Section', icon: '🦸', category: 'Sections' },
  { id: 'features', label: 'Features Grid', icon: '⚡', category: 'Sections' },
  { id: 'testimonials', label: 'Testimonials', icon: '⭐', category: 'Sections' },
  { id: 'cta', label: 'Call to Action', icon: '🎯', category: 'Sections' },
  { id: 'pricing', label: 'Pricing Table', icon: '💰', category: 'Sections' },
  { id: 'faq', label: 'FAQ', icon: '❓', category: 'Sections' },
  { id: 'contact', label: 'Contact Form', icon: '📬', category: 'Sections' },
  { id: 'gallery', label: 'Image Gallery', icon: '🖼️', category: 'Sections' },
  { id: 'video', label: 'Video Block', icon: '🎬', category: 'Sections' },
  { id: 'countdown', label: 'Countdown Timer', icon: '⏰', category: 'Sections' },
  { id: 'columns2', label: '2 Columns', icon: '◫', category: 'Layout' },
  { id: 'columns3', label: '3 Columns', icon: '⊞', category: 'Layout' },
  { id: 'spacer', label: 'Spacer', icon: '↕️', category: 'Elements' },
  { id: 'divider', label: 'Divider', icon: '—', category: 'Elements' },
  { id: 'button', label: 'Button', icon: '🔘', category: 'Elements' },
  { id: 'text', label: 'Text Block', icon: '📝', category: 'Elements' },
  { id: 'image', label: 'Image', icon: '🖼️', category: 'Elements' },
];

const defaultBlocks = [
  {
    id: '1', type: 'hero', label: 'Hero Section',
    props: {
      headline: 'Welcome to Your Amazing Website',
      subheadline: 'Build beautiful pages that convert visitors into customers.',
      ctaText: 'Get Started Free',
      ctaUrl: '#',
      bgColor: 'from-violet-600 to-indigo-700',
      textColor: '#ffffff',
    }
  },
  {
    id: '2', type: 'features', label: 'Features Grid',
    props: {
      title: 'Everything You Need to Succeed',
      features: [
        { icon: '⚡', title: 'Fast & Reliable', desc: 'Built for speed and performance at every step.' },
        { icon: '🔒', title: 'Secure by Default', desc: 'Enterprise-grade security out of the box.' },
        { icon: '📊', title: 'Analytics Built-In', desc: 'Track every visitor action and conversion.' },
      ]
    }
  },
  {
    id: '3', type: 'cta', label: 'Call to Action',
    props: {
      headline: 'Ready to Get Started?',
      subheadline: 'Join thousands of businesses growing with GigGenius.',
      ctaText: 'Start for Free',
      ctaUrl: '#',
      bgColor: 'from-indigo-600 to-violet-700',
    }
  }
];

function BlockPreview({ block, selected, onSelect, onDelete, onMoveUp, onMoveDown, onDuplicate }) {
  const renderContent = () => {
    switch (block.type) {
      case 'hero':
        return (
          <div className={`bg-gradient-to-r ${block.props.bgColor || 'from-violet-600 to-indigo-700'} text-white px-8 py-16 text-center rounded-lg`}>
            <h1 className="text-3xl font-bold mb-4">{block.props.headline}</h1>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">{block.props.subheadline}</p>
            <button className="bg-white text-violet-700 font-semibold px-8 py-3 rounded-full hover:bg-white/90 transition">{block.props.ctaText}</button>
          </div>
        );
      case 'features':
        return (
          <div className="bg-white px-8 py-12 rounded-lg">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">{block.props.title}</h2>
            <div className="grid grid-cols-3 gap-6">
              {(block.props.features || []).map((f, i) => (
                <div key={i} className="text-center p-4">
                  <div className="text-4xl mb-3">{f.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-sm">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'testimonials':
        return (
          <div className="bg-gray-50 px-8 py-12 rounded-lg">
            <h2 className="text-2xl font-bold text-center mb-8">What Our Customers Say</h2>
            <div className="grid grid-cols-2 gap-6">
              {[
                { name: 'Sarah J.', text: 'This tool completely transformed how we handle clients.', rating: 5 },
                { name: 'Michael R.', text: 'Best investment we made for our agency this year.', rating: 5 },
              ].map((t, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex text-amber-400 mb-3">{Array(t.rating).fill('★').join('')}</div>
                  <p className="text-gray-700 mb-3 italic">"{t.text}"</p>
                  <p className="font-semibold text-sm text-gray-900">{t.name}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'cta':
        return (
          <div className={`bg-gradient-to-r ${block.props.bgColor || 'from-indigo-600 to-violet-700'} text-white px-8 py-14 rounded-lg text-center`}>
            <h2 className="text-3xl font-bold mb-3">{block.props.headline}</h2>
            <p className="text-white/80 mb-8 text-lg">{block.props.subheadline}</p>
            <button className="bg-white text-indigo-700 font-bold px-10 py-3 rounded-full text-lg">{block.props.ctaText}</button>
          </div>
        );
      case 'pricing':
        return (
          <div className="bg-white px-8 py-12 rounded-lg">
            <h2 className="text-2xl font-bold text-center mb-8">Simple, Transparent Pricing</h2>
            <div className="grid grid-cols-3 gap-4">
              {['Starter', 'Pro', 'Elite'].map((plan, i) => (
                <div key={i} className={`rounded-xl p-6 border-2 ${i === 1 ? 'border-violet-500 shadow-lg' : 'border-gray-200'}`}>
                  <p className="font-bold text-lg mb-1">{plan}</p>
                  <p className="text-3xl font-black mb-4">${[29, 79, 149][i]}<span className="text-sm font-normal text-gray-500">/mo</span></p>
                  <button className={`w-full py-2 rounded-lg font-semibold ${i === 1 ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-800'}`}>Choose {plan}</button>
                </div>
              ))}
            </div>
          </div>
        );
      case 'faq':
        return (
          <div className="bg-white px-8 py-12 rounded-lg">
            <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            {['What is included?', 'How do I cancel?', 'Do you offer refunds?'].map((q, i) => (
              <div key={i} className="border-b py-4">
                <div className="flex justify-between items-center">
                  <p className="font-medium">{q}</p>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        );
      case 'contact':
        return (
          <div className="bg-gray-50 px-8 py-12 rounded-lg">
            <h2 className="text-2xl font-bold text-center mb-8">Get In Touch</h2>
            <div className="max-w-md mx-auto space-y-4">
              <input className="w-full border rounded-lg px-4 py-2 text-sm" placeholder="Your Name" readOnly />
              <input className="w-full border rounded-lg px-4 py-2 text-sm" placeholder="Email Address" readOnly />
              <textarea className="w-full border rounded-lg px-4 py-2 text-sm h-28 resize-none" placeholder="Your message..." readOnly />
              <button className="w-full bg-violet-600 text-white rounded-lg py-2.5 font-semibold">Send Message</button>
            </div>
          </div>
        );
      case 'video':
        return (
          <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                <div className="w-0 h-0 border-l-[20px] border-l-white border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1" />
              </div>
              <p className="text-sm text-white/70">Video Block — paste URL in settings</p>
            </div>
          </div>
        );
      case 'countdown':
        return (
          <div className="bg-gray-900 text-white px-8 py-12 rounded-lg text-center">
            <p className="text-lg mb-6 text-gray-300">Offer Ends In:</p>
            <div className="flex justify-center gap-6">
              {['23', '59', '45'].map((v, i) => (
                <div key={i} className="bg-white/10 rounded-xl px-6 py-4">
                  <p className="text-4xl font-black">{v}</p>
                  <p className="text-xs text-gray-400 mt-1">{['Hours', 'Mins', 'Secs'][i]}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'columns2':
        return (
          <div className="bg-white rounded-lg px-8 py-8 grid grid-cols-2 gap-6">
            {[1, 2].map(n => (
              <div key={n} className="border-2 border-dashed border-gray-200 rounded-lg p-6 min-h-[120px] flex items-center justify-center text-gray-400 text-sm">Column {n}</div>
            ))}
          </div>
        );
      case 'columns3':
        return (
          <div className="bg-white rounded-lg px-8 py-8 grid grid-cols-3 gap-4">
            {[1, 2, 3].map(n => (
              <div key={n} className="border-2 border-dashed border-gray-200 rounded-lg p-6 min-h-[100px] flex items-center justify-center text-gray-400 text-sm">Column {n}</div>
            ))}
          </div>
        );
      case 'button':
        return (
          <div className="bg-white rounded-lg px-8 py-6 text-center">
            <button className="bg-violet-600 text-white px-8 py-3 rounded-full font-semibold">Click Here</button>
          </div>
        );
      case 'text':
        return (
          <div className="bg-white rounded-lg px-8 py-6">
            <p className="text-gray-700 leading-relaxed">This is a text block. Click to edit content. You can add headings, paragraphs, and rich formatted text here.</p>
          </div>
        );
      case 'image':
        return (
          <div className="bg-gray-100 rounded-lg flex items-center justify-center h-48">
            <div className="text-center text-gray-400">
              <Image className="w-10 h-10 mx-auto mb-2" />
              <p className="text-sm">Click to upload image</p>
            </div>
          </div>
        );
      case 'spacer':
        return <div className="h-16 bg-white rounded-lg flex items-center justify-center text-gray-300 text-xs border border-dashed border-gray-200">Spacer</div>;
      case 'divider':
        return <div className="bg-white rounded-lg px-8 py-6"><hr className="border-gray-200" /></div>;
      case 'gallery':
        return (
          <div className="bg-white rounded-lg px-8 py-8">
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-300">
                  <Image className="w-6 h-6" />
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-400">{block.label}</div>;
    }
  };

  return (
    <div
      className={`relative group rounded-xl transition-all duration-150 cursor-pointer mb-3 ${selected ? 'ring-2 ring-violet-500 shadow-lg' : 'hover:ring-2 hover:ring-violet-300'}`}
      onClick={() => onSelect(block.id)}
    >
      {/* Toolbar */}
      <div className={`absolute -top-9 left-0 right-0 flex items-center justify-between bg-violet-600 text-white text-xs px-3 py-1.5 rounded-t-lg z-10 transition-opacity ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <span className="font-medium">{block.label}</span>
        <div className="flex gap-1">
          <button onClick={e => { e.stopPropagation(); onMoveUp(block.id); }} className="hover:bg-white/20 p-1 rounded"><ArrowUp className="w-3 h-3" /></button>
          <button onClick={e => { e.stopPropagation(); onMoveDown(block.id); }} className="hover:bg-white/20 p-1 rounded"><ArrowDown className="w-3 h-3" /></button>
          <button onClick={e => { e.stopPropagation(); onDuplicate(block.id); }} className="hover:bg-white/20 p-1 rounded"><Copy className="w-3 h-3" /></button>
          <button onClick={e => { e.stopPropagation(); onDelete(block.id); }} className="hover:bg-red-400/50 p-1 rounded"><Trash2 className="w-3 h-3" /></button>
        </div>
      </div>
      {renderContent()}
    </div>
  );
}

export default function SitesBuilder() {
  const [blocks, setBlocks] = useState(defaultBlocks);
  const [selectedId, setSelectedId] = useState(null);
  const [viewMode, setViewMode] = useState('desktop');
  const [dragOver, setDragOver] = useState(false);
  const [siteName, setSiteName] = useState('My Website');
  const [sidebarTab, setSidebarTab] = useState('sections');
  const [activeCategory, setActiveCategory] = useState('Sections');

  const categories = [...new Set(SECTIONS.map(s => s.category))];

  const addBlock = (section) => {
    const newBlock = {
      id: Date.now().toString(),
      type: section.id,
      label: section.label,
      props: {}
    };
    setBlocks(prev => [...prev, newBlock]);
    setSelectedId(newBlock.id);
  };

  const deleteBlock = (id) => setBlocks(prev => prev.filter(b => b.id !== id));

  const moveUp = (id) => {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id);
      if (idx === 0) return prev;
      const arr = [...prev];
      [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
      return arr;
    });
  };

  const moveDown = (id) => {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id);
      if (idx === prev.length - 1) return prev;
      const arr = [...prev];
      [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
      return arr;
    });
  };

  const duplicate = (id) => {
    const block = blocks.find(b => b.id === id);
    if (!block) return;
    const newBlock = { ...block, id: Date.now().toString() };
    const idx = blocks.findIndex(b => b.id === id);
    const arr = [...blocks];
    arr.splice(idx + 1, 0, newBlock);
    setBlocks(arr);
  };

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const sectionId = e.dataTransfer.getData('sectionId');
    const section = SECTIONS.find(s => s.id === sectionId);
    if (section) addBlock(section);
  };

  const viewWidths = { desktop: 'w-full', tablet: 'max-w-[768px]', mobile: 'max-w-[375px]' };

  return (
    <div className="flex h-[calc(100vh-200px)] bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

      {/* Left Panel — Elements */}
      <div className="w-64 border-r border-gray-100 bg-gray-50 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-100">
          <p className="font-bold text-gray-800 text-sm">Elements</p>
          <div className="flex gap-1 mt-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition ${activeCategory === cat ? 'bg-violet-600 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {SECTIONS.filter(s => s.category === activeCategory).map(section => (
            <div
              key={section.id}
              draggable
              onDragStart={e => e.dataTransfer.setData('sectionId', section.id)}
              onClick={() => addBlock(section)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-violet-50 hover:text-violet-700 transition text-gray-600 bg-white border border-gray-100 hover:border-violet-200"
            >
              <span className="text-lg">{section.icon}</span>
              <span className="text-sm font-medium">{section.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <Input value={siteName} onChange={e => setSiteName(e.target.value)} className="h-8 text-sm font-semibold w-48 border-gray-200" />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
              {[
                { key: 'desktop', Icon: Monitor },
                { key: 'tablet', Icon: Tablet },
                { key: 'mobile', Icon: Smartphone },
              ].map(({ key, Icon }) => (
                <button
                  key={key}
                  onClick={() => setViewMode(key)}
                  className={`p-1.5 rounded-md transition ${viewMode === key ? 'bg-white shadow text-violet-600' : 'text-gray-400 hover:text-gray-700'}`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
            <Button size="sm" variant="outline" className="gap-1 text-xs h-8"><Eye className="w-3.5 h-3.5" />Preview</Button>
            <Button size="sm" className="gap-1 text-xs h-8 bg-violet-600 hover:bg-violet-700"><Save className="w-3.5 h-3.5" />Save</Button>
            <Button size="sm" className="gap-1 text-xs h-8 bg-green-600 hover:bg-green-700"><Globe className="w-3.5 h-3.5" />Publish</Button>
          </div>
        </div>

        {/* Page Canvas */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <div
            className={`mx-auto bg-white shadow-2xl rounded-lg overflow-hidden transition-all duration-300 ${viewWidths[viewMode]}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {blocks.length === 0 ? (
              <div className={`flex flex-col items-center justify-center py-32 text-gray-300 border-4 border-dashed border-gray-200 rounded-xl ${dragOver ? 'bg-violet-50 border-violet-300' : ''}`}>
                <Layers className="w-16 h-16 mb-4" />
                <p className="text-lg font-medium">Drag elements here to build your page</p>
                <p className="text-sm mt-1">or click any element from the left panel</p>
              </div>
            ) : (
              <div className={`p-4 ${dragOver ? 'bg-violet-50' : ''} min-h-full`}>
                {blocks.map(block => (
                  <BlockPreview
                    key={block.id}
                    block={block}
                    selected={selectedId === block.id}
                    onSelect={setSelectedId}
                    onDelete={deleteBlock}
                    onMoveUp={moveUp}
                    onMoveDown={moveDown}
                    onDuplicate={duplicate}
                  />
                ))}
                {dragOver && (
                  <div className="border-4 border-dashed border-violet-400 bg-violet-50 rounded-xl h-20 flex items-center justify-center text-violet-500 text-sm font-medium">
                    Drop here to add block
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel — Settings */}
      <div className="w-64 border-l border-gray-100 bg-gray-50 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-100">
          <p className="font-bold text-gray-800 text-sm">Page Settings</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">Page Title</Label>
            <Input defaultValue="My Homepage" className="text-sm h-8" />
          </div>
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">URL Slug</Label>
            <Input defaultValue="/home" className="text-sm h-8" />
          </div>
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">SEO Description</Label>
            <textarea className="w-full border border-gray-200 rounded-lg text-xs px-3 py-2 h-20 resize-none text-gray-700 focus:outline-none focus:ring-1 focus:ring-violet-400" defaultValue="Welcome to our website. We help businesses grow online." />
          </div>
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">Background Color</Label>
            <div className="flex gap-2 flex-wrap">
              {['#ffffff', '#f8f9fa', '#f1f0ff', '#eff6ff', '#f0fdf4', '#1e1b4b'].map(c => (
                <button key={c} className="w-7 h-7 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: c }} title={c} />
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">Font Family</Label>
            <Select defaultValue="inter">
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="inter">Inter</SelectItem>
                <SelectItem value="poppins">Poppins</SelectItem>
                <SelectItem value="lato">Lato</SelectItem>
                <SelectItem value="montserrat">Montserrat</SelectItem>
                <SelectItem value="roboto">Roboto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-600 mb-2">Tracking</p>
            <div className="space-y-2">
              <Input placeholder="Google Analytics ID" className="text-xs h-8" />
              <Input placeholder="Facebook Pixel ID" className="text-xs h-8" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}