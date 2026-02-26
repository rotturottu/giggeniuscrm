import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, LineChart, PieChart, TrendingUp } from 'lucide-react';

const chartTypes = [
  { value: 'line', label: 'Line Chart', icon: LineChart },
  { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
  { value: 'area', label: 'Area Chart', icon: TrendingUp },
  { value: 'pie', label: 'Pie Chart', icon: PieChart },
];

export default function ChartTypeSelector({ value, onChange }) {
  return (
    <div>
      <Label className="text-sm font-medium mb-2 block">Chart Type</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select chart type" />
        </SelectTrigger>
        <SelectContent>
          {chartTypes.map(chart => {
            const Icon = chart.icon;
            return (
              <SelectItem key={chart.value} value={chart.value}>
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {chart.label}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}