import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const availableMetrics = [
  { value: 'lead_growth', label: 'Lead Growth', category: 'Leads' },
  { value: 'conversion_rate', label: 'Conversion Rate', category: 'Conversions' },
  { value: 'conversion_funnel', label: 'Conversion Funnel', category: 'Conversions' },
  { value: 'social_posts', label: 'Social Media Posts', category: 'Social Media' },
  { value: 'social_engagement', label: 'Social Engagement', category: 'Social Media' },
  { value: 'social_ctr', label: 'Click-Through Rate', category: 'Social Media' },
  { value: 'social_sentiment', label: 'Sentiment Analysis', category: 'Social Media' },
  { value: 'revenue', label: 'Revenue Trends', category: 'Sales' },
  { value: 'team_performance', label: 'Team Performance', category: 'Sales' },
];

export default function MetricsSelector({ value, onChange }) {
  const categories = [...new Set(availableMetrics.map(m => m.category))];

  return (
    <div>
      <Label className="text-sm font-medium mb-2 block">Select Metric</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Choose a metric" />
        </SelectTrigger>
        <SelectContent>
          {categories.map(category => (
            <div key={category}>
              <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">{category}</div>
              {availableMetrics
                .filter(m => m.category === category)
                .map(metric => (
                  <SelectItem key={metric.value} value={metric.value}>
                    {metric.label}
                  </SelectItem>
                ))}
            </div>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}