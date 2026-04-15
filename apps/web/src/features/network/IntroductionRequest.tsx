import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

interface IntroductionRequestProps {
  onSubmit: (
    colleagueId: string,
    contactId: string,
    message?: string,
  ) => Promise<unknown>;
}

export const IntroductionRequest: React.FC<IntroductionRequestProps> = ({
  onSubmit,
}) => {
  const [colleagueId, setColleagueId] = useState('');
  const [contactId, setContactId] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!colleagueId.trim() || !contactId.trim()) return;
    setIsSubmitting(true);
    setSuccess(false);
    try {
      await onSubmit(
        colleagueId.trim(),
        contactId.trim(),
        message.trim() || undefined,
      );
      setSuccess(true);
      setColleagueId('');
      setContactId('');
      setMessage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card padding="none">
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-gray-900">
            Request Introduction
          </h3>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Input
            label="Colleague (User ID)"
            value={colleagueId}
            onChange={(e) => setColleagueId(e.target.value)}
            placeholder="Select a colleague"
          />
          <Input
            label="Contact (Contact ID)"
            value={contactId}
            onChange={(e) => setContactId(e.target.value)}
            placeholder="Select a contact"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Add a message for the introduction…"
            />
          </div>

          {success && (
            <p className="text-sm text-success">
              Introduction request sent successfully!
            </p>
          )}

          <Button
            onClick={handleSubmit}
            isLoading={isSubmitting}
            leftIcon={<UserPlus className="h-4 w-4" />}
            disabled={!colleagueId.trim() || !contactId.trim()}
            className="w-full"
          >
            Request Introduction
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
