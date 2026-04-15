import React, { useCallback, useEffect, useState } from 'react';
import { Paperclip, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { RecipientPicker } from './RecipientPicker';
import { useEmails } from './hooks/useEmails';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

interface EmailComposerProps {
  onSent: () => void;
  onCancel: () => void;
  initialTo?: string[];
  initialSubject?: string;
  clientId?: string;
  submissionId?: string;
}

export const EmailComposer: React.FC<EmailComposerProps> = ({
  onSent,
  onCancel,
  initialTo = [],
  initialSubject = '',
  clientId,
  submissionId,
}) => {
  const { sendEmail, fetchTemplates } = useEmails();

  const [toAddresses, setToAddresses] = useState<string[]>(initialTo);
  const [ccAddresses, setCcAddresses] = useState<string[]>([]);
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchTemplates().then(setTemplates);
  }, [fetchTemplates]);

  const templateOptions = [
    { value: '', label: 'No template' },
    ...templates.map((t) => ({ value: t.id, label: t.name })),
  ];

  const handleTemplateChange = useCallback(
    (value: string) => {
      setTemplateId(value);
      const tpl = templates.find((t) => t.id === value);
      if (tpl) {
        setSubject(tpl.subject);
        setBody(tpl.body);
      }
    },
    [templates],
  );

  const handleSend = useCallback(async () => {
    if (toAddresses.length === 0) {
      setError('At least one recipient is required.');
      return;
    }
    if (!subject.trim()) {
      setError('Subject is required.');
      return;
    }
    setError(null);
    setIsSending(true);
    try {
      await sendEmail({
        to_addresses: toAddresses,
        cc_addresses: ccAddresses,
        subject,
        body_text: body,
        client_id: clientId,
        submission_id: submissionId,
        template_id: templateId || undefined,
      });
      onSent();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send email');
    } finally {
      setIsSending(false);
    }
  }, [toAddresses, ccAddresses, subject, body, clientId, submissionId, templateId, sendEmail, onSent]);

  return (
    <div className="space-y-4">
      <RecipientPicker
        label="To"
        recipients={toAddresses}
        onChange={setToAddresses}
        placeholder="Add recipients..."
      />

      <RecipientPicker
        label="CC"
        recipients={ccAddresses}
        onChange={setCcAddresses}
        placeholder="Add CC recipients..."
      />

      <Select
        label="Template"
        options={templateOptions}
        value={templateId}
        onChange={handleTemplateChange}
        placeholder="Select a template..."
      />

      <Input
        label="Subject"
        type="text"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Email subject..."
        required
      />

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Body
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Compose your email..."
          rows={12}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#2E75B6] focus:outline-none focus:ring-1 focus:ring-[#2E75B6]"
        />
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Paperclip className="h-4 w-4" />
        <span>Attachment support coming soon</span>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={() => void handleSend()}
          isLoading={isSending}
          leftIcon={<Send className="h-4 w-4" />}
        >
          Send
        </Button>
      </div>
    </div>
  );
};
