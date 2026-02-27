import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function LeadSegmentSelector({ criteria, onChange, onEstimatedCountChange }) {
  const [filters, setFilters] = useState([]);

  useEffect(() => {
    if (criteria && Object.keys(criteria).length > 0) {
      const filtersArray = Object.entries(criteria).map(([key, value]) => ({
        field: key,
        operator: value.operator || 'equals',
        value: value.value || value,
      }));
      setFilters(filtersArray);
    }
  }, [criteria]);

  const addFilter = () => {
    setFilters([...filters, { field: '', operator: 'equals', value: '' }]);
  };

  const updateFilter = (index, updates) => {
    const updated = [...filters];
    updated[index] = { ...updated[index], ...updates };
    setFilters(updated);
    updateCriteria(updated);
  };

  const removeFilter = (index) => {
    const updated = filters.filter((_, i) => i !== index);
    setFilters(updated);
    updateCriteria(updated);
  };

  const updateCriteria = (filtersArray) => {
    const criteriaObj = {};
    filtersArray.forEach((filter) => {
      if (filter.field && filter.value) {
        if (filter.operator === 'equals') {
          criteriaObj[filter.field] = filter.value;
        } else {
          criteriaObj[filter.field] = {
            operator: filter.operator,
            value: filter.value,
          };
        }
      }
    });
    onChange(criteriaObj);
    
    // Mock estimated count (in production, this would be an API call)
    const count = Math.floor(Math.random() * 500) + 50;
    onEstimatedCountChange(count);
  };

  const fieldOptions = [
    { value: 'status', label: 'Lead Status' },
    { value: 'score', label: 'Lead Score' },
    { value: 'source', label: 'Lead Source' },
    { value: 'tags', label: 'Tags' },
    { value: 'city', label: 'City' },
    { value: 'company_size', label: 'Company Size' },
  ];

  const operatorOptions = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'contains', label: 'Contains' },
  ];

  return (
    <div className="space-y-4">
      {filters.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
          No filters added. Add filters to segment your audience or send to all leads.
        </div>
      ) : (
        filters.map((filter, index) => (
          <div key={index} className="grid grid-cols-12 gap-3 items-end p-3 bg-gray-50 rounded-lg">
            <div className="col-span-4">
              <Label className="text-xs">Field</Label>
              <Select
                value={filter.field}
                onValueChange={(value) => updateFilter(index, { field: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {fieldOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-3">
              <Label className="text-xs">Operator</Label>
              <Select
                value={filter.operator}
                onValueChange={(value) => updateFilter(index, { operator: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {operatorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-4">
              <Label className="text-xs">Value</Label>
              <Input
                placeholder="Enter value"
                value={filter.value}
                onChange={(e) => updateFilter(index, { value: e.target.value })}
                className="mt-1"
              />
            </div>

            <div className="col-span-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFilter(index)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))
      )}

      <Button onClick={addFilter} variant="outline" size="sm">
        <Plus className="w-4 h-4 mr-2" />
        Add Filter
      </Button>
    </div>
  );
}