import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { useEmailParser } from './hooks/useEmailParser';
import type { Email } from '@brokerflow/shared';

interface EmailParserReviewProps {
  email: Email;
  onConfirmed: () => void;
  onRejected: () => void;
}

function confidenceVariant(confidence: number): 'success' | 'warning' | 'danger' {
  if (confidence >= 0.8) return 'success';
  if (confidence >= 0.5) return 'warning';
  return 'danger';
}

function confidenceLabel(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

export const EmailParserReview: React.FC<EmailParserReviewProps> = ({
  email,
  onConfirmed,
  onRejected,
}) => {
  const {
    parsedFields,
    isLoading,
    error,
    fetchParsedData,
    confirmParsedData,
    rejectParsedData,
  } = useEmailParser();

  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    void fetchParsedData(email.id);
  }, [email.id, fetchParsedData]);

  useEffect(() => {
    const initial: Record<string, string> = {};
    parsedFields.forEach((field) => {
      initial[field.key] = field.value;
    });
    setEditedValues(initial);
  }, [parsedFields]);

  const handleFieldChange = useCallback((key: string, value: string) => {
    setEditedValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleConfirm = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await confirmParsedData(email.id, editedValues);
      onConfirmed();
    } catch {
      // Error handled by hook
    } finally {
      setIsSubmitting(false);
    }
  }, [email.id, editedValues, confirmParsedData, onConfirmed]);

  const handleReject = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await rejectParsedData(email.id);
      onRejected();
    } catch {
      // Error handled by hook
    } finally {
      setIsSubmitting(false);
    }
  }, [email.id, rejectParsedData, onRejected]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Left panel: Original email */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-gray-900">Original Email</h3>
          <p className="text-xs text-gray-500">
            From: {email.from_address} • {new Date(email.sent_at).toLocaleDateString()}
          </p>
        </CardHeader>
        <CardContent>
          <div className="mb-2 text-sm font-medium text-gray-700">
            Subject: {email.subject}
          </div>
          <div className="max-h-[50vh] overflow-y-auto whitespace-pre-wrap rounded-md bg-gray-50 p-3 text-sm text-gray-600">
            {email.body_text}
          </div>
        </CardContent>
      </Card>

      {/* Right panel: Parsed data */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-gray-900">Parsed Data</h3>
          <p className="text-xs text-gray-500">
            Review and edit extracted fields below
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="animate-pulse">
                  <div className="mb-1 h-4 w-24 rounded bg-gray-200" />
                  <div className="h-9 rounded bg-gray-100" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : parsedFields.length === 0 ? (
            <p className="text-sm text-gray-500">No parsed data available.</p>
          ) : (
            <div className="max-h-[50vh] space-y-3 overflow-y-auto">
              {parsedFields.map((field) => (
                <div key={field.key}>
                  <div className="mb-1 flex items-center gap-2">
                    <label className="text-xs font-medium text-gray-600">
                      {field.key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </label>
                    <Badge variant={confidenceVariant(field.confidence)}>
                      {confidenceLabel(field.confidence)}
                    </Badge>
                  </div>
                  <input
                    type="text"
                    value={editedValues[field.key] ?? ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-[#2E75B6] focus:outline-none focus:ring-1 focus:ring-[#2E75B6]"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-2 border-t border-gray-100 pt-4">
            <Button
              variant="danger"
              onClick={() => void handleReject()}
              isLoading={isSubmitting}
              leftIcon={<XCircle className="h-4 w-4" />}
            >
              Reject
            </Button>
            <Button
              variant="primary"
              onClick={() => void handleConfirm()}
              isLoading={isSubmitting}
              leftIcon={<CheckCircle className="h-4 w-4" />}
            >
              Confirm
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
