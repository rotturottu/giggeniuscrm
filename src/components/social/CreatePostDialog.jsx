import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Facebook, Linkedin, MapPin, Instagram, Hash } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format, addDays } from 'date-fns';

const platformIcons = {
  facebook: { icon: Facebook, label: 'Facebook', color: 'text-blue-600' },
  linkedin: { icon: Linkedin, label: 'LinkedIn', color: 'text-blue-700' },
  google_business: { icon: MapPin, label: 'Google Business', color: 'text-red-600' },
  instagram: { icon: Instagram, label: 'Instagram', color: 'text-pink-600' },
  threads: { icon: Hash, label: 'Threads', color: 'text-gray-900' },
};

export default function CreatePostDialog({ open, onClose, accounts, maxScheduleDays }) {
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [scheduledDate, setScheduledDate] = useState(null);
  const [time, setTime] = useState('12:00');
  
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (postData) => base44.entities.ScheduledPost.create(postData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-posts'] });
      onClose();
      setContent('');
      setSelectedPlatforms([]);
      setScheduledDate(null);
      setTime('12:00');
    },
  });

  const handlePlatformToggle = (platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleSubmit = () => {
    if (!content || selectedPlatforms.length === 0 || !scheduledDate) return;

    const [hours, minutes] = time.split(':');
    const dateTime = new Date(scheduledDate);
    dateTime.setHours(parseInt(hours), parseInt(minutes));

    createMutation.mutate({
      content,
      platforms: selectedPlatforms,
      scheduled_date: dateTime.toISOString(),
      status: 'scheduled',
    });
  };

  const connectedPlatforms = accounts.map((acc) => acc.platform);
  const maxDate = addDays(new Date(), maxScheduleDays);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
            Schedule Social Media Post
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label className="text-base font-semibold mb-2 block">Post Content</Label>
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-32 text-base"
            />
          </div>

          <div>
            <Label className="text-base font-semibold mb-3 block">Select Platforms</Label>
            <div className="grid grid-cols-2 gap-3">
              {connectedPlatforms.map((platform) => {
                const { icon: Icon, label, color } = platformIcons[platform];
                return (
                  <label
                    key={platform}
                    className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <Checkbox
                      checked={selectedPlatforms.includes(platform)}
                      onCheckedChange={() => handlePlatformToggle(platform)}
                    />
                    <Icon className={`w-5 h-5 ${color}`} />
                    <span className="font-medium">{label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <Label className="text-base font-semibold mb-2 block">Schedule Date & Time</Label>
            <div className="flex gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex-1 justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduledDate ? format(scheduledDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={scheduledDate}
                    onSelect={setScheduledDate}
                    disabled={(date) => date < new Date() || date > maxDate}
                  />
                </PopoverContent>
              </Popover>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              You can schedule up to {maxScheduleDays} days in advance
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !content ||
                selectedPlatforms.length === 0 ||
                !scheduledDate ||
                createMutation.isPending
              }
              className="bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700"
            >
              Schedule Post
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}