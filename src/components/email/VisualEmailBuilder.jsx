import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import {
    AlignLeft,
    ChevronDown,
    ChevronUp,
    Code,
    Columns,
    Copy,
    Eye,
    GripVertical,
    Image,
    Layout,
    Minus,
    Monitor,
    Plus,
    Smartphone,
    Square,
    Star,
    Trash2,
    Type
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

// ─── Block type definitions ───────────────────────────────────────────────────
const BLOCK_TYPES = [
  {
    id: 'header',
    label: 'Header',
    icon: Star,
    category: 'Structure',
    defaultProps: { logoUrl: '', logoAlt: 'Logo', bgColor: '#3b82f6', textColor: '#ffffff', title: 'Your Company' },
  },
  {
    id: 'heading',
    label: 'Heading',
    icon: Type,
    category: 'Content',
    defaultProps: { text: 'Your Heading Here', level: 'h2', color: '#1f2937', align: 'left', fontSize: '28' },
  },
  {
    id: 'text',
    label: 'Text Block',
    icon: AlignLeft,
    category: 'Content',
    defaultProps: { text: 'Add your text content here. Use {{first_name}} for personalization.', color: '#4b5563', align: 'left', fontSize: '16' },
  },
  {
    id: 'image',
    label: 'Image',
    icon: Image,
    category: 'Content',
    defaultProps: { src: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=300&fit=crop', alt: 'Image', align: 'center', width: '100' },
  },
  {
    id: 'button',
    label: 'Button',
    icon: Square,
    category: 'Content',
    defaultProps: { text: 'Click Here', url: '#', bgColor: '#3b82f6', textColor: '#ffffff', align: 'center', borderRadius: '6' },
  },
  {
    id: 'columns',
    label: 'Two Columns',
    icon: Columns,
    category: 'Layout',
    defaultProps: { col1: 'Left column content here.', col2: 'Right column content here.', col1Color: '#4b5563', col2Color: '#4b5563' },
  },
  {
    id: 'divider',
    label: 'Divider',
    icon: Minus,
    category: 'Layout',
    defaultProps: { color: '#e5e7eb', thickness: '1', margin: '20' },
  },
  {
    id: 'spacer',
    label: 'Spacer',
    icon: Layout,
    category: 'Layout',
    defaultProps: { height: '30' },
  },
  {
    id: 'footer',
    label: 'Footer',
    icon: AlignLeft,
    category: 'Structure',
    defaultProps: { text: '© 2024 Your Company. All rights reserved.', address: '123 Street, City, Country', unsubscribeText: 'Unsubscribe', bgColor: '#f9fafb', textColor: '#6b7280' },
  },
];

const DYNAMIC_FIELDS = [
  { label: 'First Name', value: '{{first_name}}' },
  { label: 'Last Name', value: '{{last_name}}' },
  { label: 'Full Name', value: '{{lead_name}}' },
  { label: 'Email', value: '{{lead_email}}' },
  { label: 'Company', value: '{{company}}' },
  { label: 'Sales Rep', value: '{{sales_rep_name}}' },
  { label: 'Date', value: '{{current_date}}' },
];

// ─── HTML renderer ────────────────────────────────────────────────────────────
function renderBlockHtml(block) {
  const p = block.props;
  switch (block.type) {
    case 'header':
      return `<table width="100%" cellpadding="0" cellspacing="0" style="background:${p.bgColor};padding:20px 30px;"><tr>${p.logoUrl ? `<td width="60"><img src="${p.logoUrl}" alt="${p.logoAlt}" style="height:48px;width:auto;" /></td>` : ''}<td style="font-family:Arial,sans-serif;color:${p.textColor};font-size:22px;font-weight:bold;">${p.title}</td></tr></table>`;
    case 'heading': {
      const tag = p.level || 'h2';
      return `<${tag} style="font-family:Arial,sans-serif;color:${p.color};font-size:${p.fontSize}px;text-align:${p.align};margin:0 0 12px 0;">${p.text}</${tag}>`;
    }
    case 'text':
      return `<p style="font-family:Arial,sans-serif;color:${p.color};font-size:${p.fontSize}px;line-height:1.7;text-align:${p.align};margin:0 0 16px 0;">${p.text.replace(/\n/g, '<br/>')}</p>`;
    case 'image':
      return `<div style="text-align:${p.align};margin:0 0 16px 0;"><img src="${p.src}" alt="${p.alt}" style="max-width:${p.width}%;height:auto;display:inline-block;" /></div>`;
    case 'button':
      return `<div style="text-align:${p.align};margin:20px 0;"><a href="${p.url}" style="background:${p.bgColor};color:${p.textColor};padding:12px 30px;text-decoration:none;border-radius:${p.borderRadius}px;display:inline-block;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">${p.text}</a></div>`;
    case 'columns':
      return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px 0;"><tr><td width="50%" style="padding-right:12px;font-family:Arial,sans-serif;color:${p.col1Color};font-size:15px;vertical-align:top;">${p.col1}</td><td width="50%" style="padding-left:12px;font-family:Arial,sans-serif;color:${p.col2Color};font-size:15px;vertical-align:top;">${p.col2}</td></tr></table>`;
    case 'divider':
      return `<hr style="border:none;border-top:${p.thickness}px solid ${p.color};margin:${p.margin}px 0;" />`;
    case 'spacer':
      return `<div style="height:${p.height}px;"></div>`;
    case 'footer':
      return `<table width="100%" cellpadding="0" cellspacing="0" style="background:${p.bgColor};padding:24px 30px;margin-top:20px;"><tr><td style="font-family:Arial,sans-serif;color:${p.textColor};font-size:13px;text-align:center;"><p style="margin:0 0 6px 0;">${p.text}</p><p style="margin:0 0 6px 0;">${p.address}</p><a href="{{unsubscribe_url}}" style="color:${p.textColor};">${p.unsubscribeText}</a></td></tr></table>`;
    default:
      return '';
  }
}

function buildFullHtml(blocks) {
  const headerBlocks = blocks.filter(b => b.type === 'header');
  const footerBlocks = blocks.filter(b => b.type === 'footer');
  const bodyBlocks = blocks.filter(b => b.type !== 'header' && b.type !== 'footer');
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><style>body{margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;}.email-wrap{max-width:600px;margin:0 auto;background:#ffffff;}.email-body{padding:30px;}@media(max-width:600px){.email-body{padding:16px;}}</style></head><body><div class="email-wrap">${headerBlocks.map(renderBlockHtml).join('')}<div class="email-body">${bodyBlocks.map(renderBlockHtml).join('\n')}</div>${footerBlocks.map(renderBlockHtml).join('')}</div></body></html>`;
}

// ─── Block thumbnail preview in sidebar ──────────────────────────────────────
function BlockThumbnail({ type }) {
  const thumbnails = {
    header: (
      <div className="w-full h-8 rounded flex items-center px-2 gap-1.5" style={{ background: '#3b82f6' }}>
        <div className="w-4 h-4 rounded-sm bg-white/30" />
        <div className="h-2 w-16 rounded bg-white/70" />
      </div>
    ),
    heading: (
      <div className="w-full flex flex-col gap-1 px-1">
        <div className="h-3 w-3/4 rounded bg-gray-800" />
        <div className="h-2 w-1/2 rounded bg-gray-300" />
      </div>
    ),
    text: (
      <div className="w-full flex flex-col gap-1 px-1">
        <div className="h-1.5 w-full rounded bg-gray-300" />
        <div className="h-1.5 w-5/6 rounded bg-gray-300" />
        <div className="h-1.5 w-4/6 rounded bg-gray-300" />
      </div>
    ),
    image: (
      <div className="w-full h-10 rounded bg-gray-200 flex items-center justify-center">
        <Image className="w-4 h-4 text-gray-400" />
      </div>
    ),
    button: (
      <div className="w-full flex justify-center">
        <div className="h-5 px-4 rounded text-white text-xs flex items-center" style={{ background: '#3b82f6' }}>Button</div>
      </div>
    ),
    columns: (
      <div className="w-full flex gap-1 px-1">
        <div className="flex-1 flex flex-col gap-1">
          <div className="h-1.5 w-full rounded bg-gray-300" />
          <div className="h-1.5 w-3/4 rounded bg-gray-300" />
        </div>
        <div className="w-px bg-gray-200" />
        <div className="flex-1 flex flex-col gap-1">
          <div className="h-1.5 w-full rounded bg-gray-300" />
          <div className="h-1.5 w-2/3 rounded bg-gray-300" />
        </div>
      </div>
    ),
    divider: (
      <div className="w-full px-1 flex items-center"><div className="h-px w-full bg-gray-400" /></div>
    ),
    spacer: (
      <div className="w-full px-1 flex items-center justify-center">
        <div className="border-t border-b border-dashed border-gray-300 h-4 w-full flex items-center justify-center">
          <span className="text-gray-300 text-xs">space</span>
        </div>
      </div>
    ),
    footer: (
      <div className="w-full h-8 rounded flex items-center justify-center px-2" style={{ background: '#f9fafb' }}>
        <div className="h-1.5 w-24 rounded bg-gray-300" />
      </div>
    ),
  };
  return thumbnails[type] || <div className="w-full h-6 bg-gray-100 rounded" />;
}

// ─── Right Panel: Block settings ──────────────────────────────────────────────
function ColorInput({ label, value, onChange }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</Label>
      <div className="flex gap-2">
        <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border border-gray-200 p-0.5 flex-shrink-0" />
        <Input value={value || ''} onChange={e => onChange(e.target.value)} className="h-8 text-xs font-mono flex-1" />
      </div>
    </div>
  );
}

function AlignPicker({ value, onChange }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Alignment</Label>
      <div className="flex gap-1">
        {['left', 'center', 'right'].map(a => (
          <button key={a} onClick={() => onChange(a)}
            className={`flex-1 py-1 text-xs rounded border capitalize transition-colors ${value === a ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 hover:border-blue-300 text-gray-600'}`}>
            {a}
          </button>
        ))}
      </div>
    </div>
  );
}

function DynamicFieldInserter({ onInsert }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Insert Variable</Label>
      <div className="flex flex-wrap gap-1">
        {DYNAMIC_FIELDS.map(f => (
          <button key={f.value} onClick={() => onInsert(f.value)}
            className="px-2 py-0.5 text-xs rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors">
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-4 mb-2 px-0">{children}</div>;
}

function FieldRow({ label, children }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</Label>
      {children}
    </div>
  );
}

function BlockEditor({ block, onChange, onDelete, onDuplicate }) {
  const p = block.props;
  const set = (k, v) => onChange({ ...block, props: { ...p, [k]: v } });
  const blockDef = BLOCK_TYPES.find(b => b.id === block.type);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-white flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {blockDef && <blockDef.icon className="w-4 h-4 text-blue-600" />}
            <span className="text-sm font-semibold text-gray-800">{blockDef?.label || 'Block'}</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={onDuplicate} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600" title="Duplicate">
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button onClick={onDelete} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500" title="Delete">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {block.type === 'header' && <>
          <SectionLabel>Content</SectionLabel>
          <FieldRow label="Company Name">
            <Input value={p.title} onChange={e => set('title', e.target.value)} className="h-8 text-sm" />
          </FieldRow>
          <FieldRow label="Logo URL">
            <Input value={p.logoUrl} onChange={e => set('logoUrl', e.target.value)} placeholder="https://..." className="h-8 text-sm" />
          </FieldRow>
          <SectionLabel>Style</SectionLabel>
          <ColorInput label="Background" value={p.bgColor} onChange={v => set('bgColor', v)} />
          <ColorInput label="Text Color" value={p.textColor} onChange={v => set('textColor', v)} />
        </>}

        {block.type === 'heading' && <>
          <SectionLabel>Content</SectionLabel>
          <FieldRow label="Text">
            <Input value={p.text} onChange={e => set('text', e.target.value)} className="h-8 text-sm" />
          </FieldRow>
          <DynamicFieldInserter onInsert={f => set('text', (p.text || '') + f)} />
          <SectionLabel>Style</SectionLabel>
          <FieldRow label="Heading Level">
            <div className="flex gap-1">
              {['h1', 'h2', 'h3'].map(h => (
                <button key={h} onClick={() => set('level', h)}
                  className={`flex-1 py-1 text-xs rounded border font-medium ${p.level === h ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'}`}>
                  {h.toUpperCase()}
                </button>
              ))}
            </div>
          </FieldRow>
          <FieldRow label="Font Size (px)">
            <Input type="number" value={p.fontSize} onChange={e => set('fontSize', e.target.value)} className="h-8 text-sm w-24" />
          </FieldRow>
          <AlignPicker value={p.align} onChange={v => set('align', v)} />
          <ColorInput label="Color" value={p.color} onChange={v => set('color', v)} />
        </>}

        {block.type === 'text' && <>
          <SectionLabel>Content</SectionLabel>
          <FieldRow label="Text">
            <textarea value={p.text} onChange={e => set('text', e.target.value)} rows={5}
              className="w-full text-sm border border-gray-200 rounded-md p-2 resize-y focus:ring-1 focus:ring-blue-400 focus:border-blue-400 outline-none" />
          </FieldRow>
          <DynamicFieldInserter onInsert={f => set('text', (p.text || '') + f)} />
          <SectionLabel>Style</SectionLabel>
          <FieldRow label="Font Size (px)">
            <Input type="number" value={p.fontSize} onChange={e => set('fontSize', e.target.value)} className="h-8 text-sm w-24" />
          </FieldRow>
          <AlignPicker value={p.align} onChange={v => set('align', v)} />
          <ColorInput label="Text Color" value={p.color} onChange={v => set('color', v)} />
        </>}

        {block.type === 'image' && <>
          <SectionLabel>Content</SectionLabel>
          <FieldRow label="Image URL">
            <Input value={p.src} onChange={e => set('src', e.target.value)} placeholder="https://..." className="h-8 text-sm" />
          </FieldRow>
          {p.src && <img src={p.src} alt={p.alt} className="w-full rounded-lg border object-cover max-h-28" onError={e => e.target.style.display = 'none'} />}
          <FieldRow label="Alt Text">
            <Input value={p.alt} onChange={e => set('alt', e.target.value)} className="h-8 text-sm" />
          </FieldRow>
          <SectionLabel>Style</SectionLabel>
          <FieldRow label="Width (%)">
            <Input type="number" min="10" max="100" value={p.width} onChange={e => set('width', e.target.value)} className="h-8 text-sm w-24" />
          </FieldRow>
          <AlignPicker value={p.align} onChange={v => set('align', v)} />
        </>}

        {block.type === 'button' && <>
          <SectionLabel>Content</SectionLabel>
          <FieldRow label="Button Text">
            <Input value={p.text} onChange={e => set('text', e.target.value)} className="h-8 text-sm" />
          </FieldRow>
          <FieldRow label="URL">
            <Input value={p.url} onChange={e => set('url', e.target.value)} placeholder="https://..." className="h-8 text-sm" />
          </FieldRow>
          <SectionLabel>Style</SectionLabel>
          <AlignPicker value={p.align} onChange={v => set('align', v)} />
          <FieldRow label="Border Radius (px)">
            <Input type="number" value={p.borderRadius} onChange={e => set('borderRadius', e.target.value)} className="h-8 text-sm w-24" />
          </FieldRow>
          <ColorInput label="Background Color" value={p.bgColor} onChange={v => set('bgColor', v)} />
          <ColorInput label="Text Color" value={p.textColor} onChange={v => set('textColor', v)} />
        </>}

        {block.type === 'columns' && <>
          <SectionLabel>Left Column</SectionLabel>
          <FieldRow label="Content">
            <textarea value={p.col1} onChange={e => set('col1', e.target.value)} rows={3}
              className="w-full text-sm border border-gray-200 rounded-md p-2 resize-y focus:ring-1 focus:ring-blue-400 outline-none" />
          </FieldRow>
          <ColorInput label="Text Color" value={p.col1Color} onChange={v => set('col1Color', v)} />
          <SectionLabel>Right Column</SectionLabel>
          <FieldRow label="Content">
            <textarea value={p.col2} onChange={e => set('col2', e.target.value)} rows={3}
              className="w-full text-sm border border-gray-200 rounded-md p-2 resize-y focus:ring-1 focus:ring-blue-400 outline-none" />
          </FieldRow>
          <ColorInput label="Text Color" value={p.col2Color} onChange={v => set('col2Color', v)} />
          <DynamicFieldInserter onInsert={f => set('col1', (p.col1 || '') + f)} />
        </>}

        {block.type === 'divider' && <>
          <SectionLabel>Style</SectionLabel>
          <FieldRow label="Thickness (px)">
            <Input type="number" min="1" max="10" value={p.thickness} onChange={e => set('thickness', e.target.value)} className="h-8 text-sm w-24" />
          </FieldRow>
          <FieldRow label="Margin (px)">
            <Input type="number" value={p.margin} onChange={e => set('margin', e.target.value)} className="h-8 text-sm w-24" />
          </FieldRow>
          <ColorInput label="Color" value={p.color} onChange={v => set('color', v)} />
        </>}

        {block.type === 'spacer' && <>
          <SectionLabel>Size</SectionLabel>
          <FieldRow label="Height (px)">
            <Input type="number" min="5" max="200" value={p.height} onChange={e => set('height', e.target.value)} className="h-8 text-sm w-24" />
          </FieldRow>
        </>}

        {block.type === 'footer' && <>
          <SectionLabel>Content</SectionLabel>
          <FieldRow label="Copyright Text">
            <Input value={p.text} onChange={e => set('text', e.target.value)} className="h-8 text-sm" />
          </FieldRow>
          <FieldRow label="Address">
            <Input value={p.address} onChange={e => set('address', e.target.value)} className="h-8 text-sm" />
          </FieldRow>
          <FieldRow label="Unsubscribe Text">
            <Input value={p.unsubscribeText} onChange={e => set('unsubscribeText', e.target.value)} className="h-8 text-sm" />
          </FieldRow>
          <SectionLabel>Style</SectionLabel>
          <ColorInput label="Background" value={p.bgColor} onChange={v => set('bgColor', v)} />
          <ColorInput label="Text Color" value={p.textColor} onChange={v => set('textColor', v)} />
        </>}
      </div>
    </div>
  );
}

// ─── Canvas Block Row ─────────────────────────────────────────────────────────
function CanvasBlock({ block, index, isSelected, onSelect, onDelete, onDuplicate, onMove, totalBlocks }) {
  const def = BLOCK_TYPES.find(b => b.id === block.type);
  return (
    <Draggable draggableId={block.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`relative group transition-all ${snapshot.isDragging ? 'opacity-75 scale-[1.02] shadow-2xl z-50' : ''}`}
        >
          {/* Selection border overlay */}
          <div
            onClick={() => onSelect(block.id)}
            className={`relative border-2 transition-all cursor-pointer rounded-sm
              ${isSelected ? 'border-blue-500' : 'border-transparent hover:border-blue-300'}
            `}
          >
            {/* Top action bar - shown on hover or select */}
            <div className={`absolute -top-px left-0 right-0 h-7 flex items-center justify-between px-2 z-10 transition-opacity
              ${isSelected ? 'opacity-100 bg-blue-500' : 'opacity-0 group-hover:opacity-100 bg-blue-400'}
              rounded-t-sm`}
              style={{ top: '-26px' }}
            >
              <div className="flex items-center gap-1.5">
                <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing text-white/80 hover:text-white" onClick={e => e.stopPropagation()}>
                  <GripVertical className="w-3.5 h-3.5" />
                </div>
                <span className="text-white text-xs font-medium">{def?.label || block.type}</span>
              </div>
              <div className="flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
                <button onClick={() => onMove(block.id, 'up')} disabled={index === 0}
                  className="p-0.5 rounded text-white/80 hover:text-white hover:bg-white/20 disabled:opacity-30">
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button onClick={() => onMove(block.id, 'down')} disabled={index === totalBlocks - 1}
                  className="p-0.5 rounded text-white/80 hover:text-white hover:bg-white/20 disabled:opacity-30">
                  <ChevronDown className="w-3 h-3" />
                </button>
                <button onClick={() => onDuplicate(block.id)}
                  className="p-0.5 rounded text-white/80 hover:text-white hover:bg-white/20">
                  <Copy className="w-3 h-3" />
                </button>
                <button onClick={() => onDelete(block.id)}
                  className="p-0.5 rounded text-white/80 hover:text-white hover:bg-red-400">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Block HTML Preview */}
            <div
              className="pointer-events-none select-none bg-white"
              dangerouslySetInnerHTML={{ __html: renderBlockHtml(block) }}
            />
          </div>
        </div>
      )}
    </Draggable>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function VisualEmailBuilder({ onContentChange, initialBlocks = [] }) {
  const [blocks, setBlocks] = useState(() =>
    initialBlocks.map(b => {
      if (b.props) return b;
      const def = BLOCK_TYPES.find(t => t.id === b.type);
      return { ...b, props: def ? { ...def.defaultProps } : {} };
    })
  );
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [isDraggingNew, setIsDraggingNew] = useState(null);

  useEffect(() => {
    if (initialBlocks && initialBlocks.length > 0) {
      const normalized = initialBlocks.map(b => {
        if (b.props) return b;
        const def = BLOCK_TYPES.find(t => t.id === b.type);
        return { ...b, props: def ? { ...def.defaultProps } : {} };
      });
      setBlocks(normalized);
    }
  }, [JSON.stringify(initialBlocks)]);

  const notify = useCallback((newBlocks) => {
    if (onContentChange) onContentChange(buildFullHtml(newBlocks), newBlocks);
  }, [onContentChange]);

  const addBlock = (typeId, atIndex) => {
    const def = BLOCK_TYPES.find(b => b.id === typeId);
    if (!def) return;
    const newBlock = { id: `block-${Date.now()}`, type: typeId, props: { ...def.defaultProps } };
    const updated = [...blocks];
    if (atIndex !== undefined) {
      updated.splice(atIndex, 0, newBlock);
    } else {
      updated.push(newBlock);
    }
    setBlocks(updated);
    setSelectedBlockId(newBlock.id);
    notify(updated);
  };

  const updateBlock = (updatedBlock) => {
    const updated = blocks.map(b => b.id === updatedBlock.id ? updatedBlock : b);
    setBlocks(updated);
    notify(updated);
  };

  const deleteBlock = (id) => {
    const updated = blocks.filter(b => b.id !== id);
    setBlocks(updated);
    if (selectedBlockId === id) setSelectedBlockId(null);
    notify(updated);
  };

  const duplicateBlock = (id) => {
    const idx = blocks.findIndex(b => b.id === id);
    if (idx === -1) return;
    const orig = blocks[idx];
    const copy = { ...orig, id: `block-${Date.now()}`, props: { ...orig.props } };
    const updated = [...blocks];
    updated.splice(idx + 1, 0, copy);
    setBlocks(updated);
    setSelectedBlockId(copy.id);
    notify(updated);
  };

  const moveBlock = (id, dir) => {
    const idx = blocks.findIndex(b => b.id === id);
    if (dir === 'up' && idx === 0) return;
    if (dir === 'down' && idx === blocks.length - 1) return;
    const updated = [...blocks];
    const swap = dir === 'up' ? idx - 1 : idx + 1;
    [updated[idx], updated[swap]] = [updated[swap], updated[idx]];
    setBlocks(updated);
    notify(updated);
  };

  const onDragEnd = (result) => {
    setIsDraggingNew(null);
    if (!result.destination) return;

    // Dragging from sidebar to canvas
    if (result.source.droppableId === 'block-palette') {
      const typeId = result.draggableId.replace('palette-', '');
      addBlock(typeId, result.destination.index);
      return;
    }

    // Reordering within canvas
    if (result.source.droppableId === 'email-canvas' && result.destination.droppableId === 'email-canvas') {
      const updated = Array.from(blocks);
      const [removed] = updated.splice(result.source.index, 1);
      updated.splice(result.destination.index, 0, removed);
      setBlocks(updated);
      notify(updated);
    }
  };

  const onDragStart = (start) => {
    if (start.source.droppableId === 'block-palette') {
      setIsDraggingNew(start.draggableId.replace('palette-', ''));
    }
  };

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);
  const categories = [...new Set(BLOCK_TYPES.map(b => b.category))];

  return (
    <div className="flex flex-col bg-gray-100" style={{ height: '680px' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">Visual Builder</span>
          <span className="text-xs text-gray-400">— drag blocks from the left panel</span>
        </div>
        <div className="flex items-center gap-2">
          {previewMode && (
            <div className="flex items-center gap-1 border rounded-md p-0.5 bg-gray-50">
              <button onClick={() => setPreviewDevice('desktop')}
                className={`p-1.5 rounded ${previewDevice === 'desktop' ? 'bg-white shadow text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
                <Monitor className="w-4 h-4" />
              </button>
              <button onClick={() => setPreviewDevice('mobile')}
                className={`p-1.5 rounded ${previewDevice === 'mobile' ? 'bg-white shadow text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          )}
          <Button size="sm" variant={previewMode ? 'default' : 'outline'}
            onClick={() => { setPreviewMode(!previewMode); setSelectedBlockId(null); }}>
            {previewMode ? <><Code className="w-3.5 h-3.5 mr-1.5" />Edit</> : <><Eye className="w-3.5 h-3.5 mr-1.5" />Preview</>}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>

          {/* LEFT: Block Palette */}
          {!previewMode && (
            <div className="w-52 bg-white border-r flex-shrink-0 overflow-y-auto">
              <div className="p-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Elements</p>
                {categories.map(cat => (
                  <div key={cat} className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">{cat}</p>
                    <Droppable droppableId="block-palette" isDropDisabled={true}>
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-1.5">
                          {BLOCK_TYPES.filter(b => b.category === cat).map((bt, index) => {
                            const Icon = bt.icon;
                            return (
                              <Draggable key={bt.id} draggableId={`palette-${bt.id}`} index={index}>
                                {(prov, snap) => (
                                  <>
                                    <div
                                      ref={prov.innerRef}
                                      {...prov.draggableProps}
                                      {...prov.dragHandleProps}
                                      className={`p-2 rounded-lg border-2 border-dashed cursor-grab active:cursor-grabbing transition-all
                                        ${snap.isDragging ? 'border-blue-400 bg-blue-50 shadow-xl rotate-1' : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'}`}
                                    >
                                      <div className="flex items-center gap-2 mb-2">
                                        <Icon className="w-3.5 h-3.5 text-gray-500" />
                                        <span className="text-xs font-medium text-gray-700">{bt.label}</span>
                                      </div>
                                      <BlockThumbnail type={bt.id} />
                                    </div>
                                    {snap.isDragging && (
                                      <div className="p-2 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 opacity-50">
                                        <div className="flex items-center gap-2 mb-2">
                                          <Icon className="w-3.5 h-3.5 text-gray-300" />
                                          <span className="text-xs font-medium text-gray-300">{bt.label}</span>
                                        </div>
                                        <BlockThumbnail type={bt.id} />
                                      </div>
                                    )}
                                  </>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CENTER: Email Canvas */}
          <div className={`flex-1 overflow-y-auto ${previewMode ? 'flex justify-center items-start p-8 bg-gray-200' : 'p-6 bg-gray-100'}`}>
            {previewMode ? (
              <div className="bg-white shadow-2xl overflow-hidden transition-all"
                style={{ width: previewDevice === 'mobile' ? '375px' : '600px', minHeight: '400px' }}>
                {blocks.length === 0
                  ? <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No blocks added yet</div>
                  : blocks.map(b => (
                    <div key={b.id} dangerouslySetInnerHTML={{ __html: renderBlockHtml(b) }} />
                  ))
                }
              </div>
            ) : (
              <div className="max-w-2xl mx-auto">
                <Droppable droppableId="email-canvas">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-96 transition-all pt-6 ${snapshot.isDraggingOver ? 'outline-dashed outline-2 outline-blue-400 outline-offset-4 rounded-lg bg-blue-50/30' : ''}`}
                    >
                      {blocks.length === 0 && !snapshot.isDraggingOver && (
                        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-xl bg-white text-gray-400">
                          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <Plus className="w-8 h-8 opacity-40" />
                          </div>
                          <p className="text-sm font-medium">Drag elements here</p>
                          <p className="text-xs mt-1">from the left panel</p>
                        </div>
                      )}
                      {blocks.length === 0 && snapshot.isDraggingOver && (
                        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-blue-400 rounded-xl bg-blue-50 text-blue-500">
                          <p className="text-sm font-medium">Drop here to add</p>
                        </div>
                      )}
                      <div className="space-y-1 bg-white shadow-sm rounded-lg overflow-hidden">
                        {blocks.map((block, index) => (
                          <CanvasBlock
                            key={block.id}
                            block={block}
                            index={index}
                            isSelected={selectedBlockId === block.id}
                            onSelect={setSelectedBlockId}
                            onDelete={deleteBlock}
                            onDuplicate={duplicateBlock}
                            onMove={moveBlock}
                            totalBlocks={blocks.length}
                          />
                        ))}
                      </div>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            )}
          </div>

          {/* RIGHT: Settings Panel */}
          {!previewMode && (
            <div className="w-64 bg-white border-l flex-shrink-0 flex flex-col">
              {selectedBlock ? (
                <BlockEditor
                  block={selectedBlock}
                  onChange={updateBlock}
                  onDelete={() => deleteBlock(selectedBlock.id)}
                  onDuplicate={() => duplicateBlock(selectedBlock.id)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center p-6">
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <Layout className="w-7 h-7 opacity-30" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">No block selected</p>
                  <p className="text-xs mt-1">Click a block on the canvas to edit its settings</p>
                </div>
              )}
            </div>
          )}

        </DragDropContext>
      </div>
    </div>
  );
}