import React, { useCallback, useEffect, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  Paperclip,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useEmails } from './hooks/useEmails';
import { EmailDirection, type Email, type EmailAttachment } from '@marketmosaic/shared';

interface EmailThreadProps {
  email: Email;
  onReply: (email: Email) => void;
  onClose: () => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const AttachmentItem: React.FC<{ attachment: EmailAttachment }> = ({ attachment }) => (
  <a
    href={attachment.url}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
  >
    <FileText className="h-4 w-4 text-gray-400" />
    <span className="flex-1 truncate font-medium text-gray-700">
      {attachment.filename}
    </span>
    <span className="text-xs text-gray-400">
      {formatFileSize(attachment.size)}
    </span>
  </a>
);

const EmailMessage: React.FC<{ email: Email }> = ({ email }) => {
  const isInbound = email.direction === EmailDirection.inbound;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {isInbound ? (
                <ArrowDownLeft className="h-4 w-4 text-[#2E75B6]" />
              ) : (
                <ArrowUpRight className="h-4 w-4 text-[#16A34A]" />
              )}
              <span className="text-sm font-semibold text-gray-900">
                {email.from_address}
              </span>
              <Badge variant={isInbound ? 'primary' : 'success'}>
                {email.direction}
              </Badge>
            </div>
            <div className="mt-1 text-xs text-gray-500">
              <span>To: {email.to_addresses.join(', ')}</span>
              {email.cc_addresses.length > 0 && (
                <span className="ml-3">CC: {email.cc_addresses.join(', ')}</span>
              )}
            </div>
          </div>
          <span className="text-xs text-gray-400">{formatDate(email.sent_at)}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="whitespace-pre-wrap text-sm text-gray-700">
          {email.body_text}
        </div>
        {email.attachments.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-1 text-xs font-medium text-gray-500">
              <Paperclip className="h-3 w-3" />
              {email.attachments.length} attachment{email.attachments.length > 1 ? 's' : ''}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {email.attachments.map((att) => (
                <AttachmentItem key={att.filename} attachment={att} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const EmailThread: React.FC<EmailThreadProps> = ({
  email,
  onReply,
  onClose,
}) => {
  const { fetchThread } = useEmails();
  const [threadEmails, setThreadEmails] = useState<Email[]>([email]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!email.thread_id) {
      setThreadEmails([email]);
      return;
    }
    setIsLoading(true);
    void fetchThread(email.thread_id)
      .then((emails) => {
        const sorted = [...emails].sort(
          (a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime(),
        );
        setThreadEmails(sorted.length > 0 ? sorted : [email]);
      })
      .catch(() => {
        setThreadEmails([email]);
      })
      .finally(() => setIsLoading(false));
  }, [email, fetchThread]);

  const handleReply = useCallback(() => {
    onReply(email);
  }, [email, onReply]);

  return (
    <div className="space-y-4">
      <div className="border-b border-gray-200 pb-3">
        <h2 className="text-lg font-semibold text-gray-900">{email.subject}</h2>
        <p className="mt-1 text-sm text-gray-500">
          {threadEmails.length} message{threadEmails.length > 1 ? 's' : ''} in thread
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="animate-pulse">
              <div className="h-32 rounded-lg bg-gray-100" />
            </div>
          ))}
        </div>
      ) : (
        <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
          {threadEmails.map((msg) => (
            <EmailMessage key={msg.id} email={msg} />
          ))}
        </div>
      )}

      <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleReply}>
          Reply
        </Button>
      </div>
    </div>
  );
};
