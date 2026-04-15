import React from 'react';
import {
  Mail,
  MailOpen,
  FileText,
  DollarSign,
  CheckCircle,
  XCircle,
  StickyNote,
  UserPlus,
  Upload,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ActivityType } from '@marketmosaic/shared';
import type { Activity } from '@marketmosaic/shared';

const typeIconMap: Record<string, { icon: React.ReactNode; color: string }> = {
  [ActivityType.email_sent]: { icon: <Mail className="h-4 w-4" />, color: 'bg-blue-100 text-blue-600' },
  [ActivityType.email_received]: { icon: <MailOpen className="h-4 w-4" />, color: 'bg-blue-100 text-blue-600' },
  [ActivityType.submission_created]: { icon: <FileText className="h-4 w-4" />, color: 'bg-purple-100 text-purple-600' },
  [ActivityType.quote_received]: { icon: <DollarSign className="h-4 w-4" />, color: 'bg-green-100 text-green-600' },
  [ActivityType.bound]: { icon: <CheckCircle className="h-4 w-4" />, color: 'bg-green-100 text-green-600' },
  [ActivityType.declined]: { icon: <XCircle className="h-4 w-4" />, color: 'bg-red-100 text-red-600' },
  [ActivityType.note_added]: { icon: <StickyNote className="h-4 w-4" />, color: 'bg-yellow-100 text-yellow-600' },
  [ActivityType.contact_created]: { icon: <UserPlus className="h-4 w-4" />, color: 'bg-indigo-100 text-indigo-600' },
  [ActivityType.document_uploaded]: { icon: <Upload className="h-4 w-4" />, color: 'bg-gray-100 text-gray-600' },
  [ActivityType.renewal_alert]: { icon: <AlertTriangle className="h-4 w-4" />, color: 'bg-orange-100 text-orange-600' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

interface ActivityItemProps {
  activity: Activity;
  isLast?: boolean;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ activity, isLast }) => {
  const typeConfig = typeIconMap[activity.type] || {
    icon: <FileText className="h-4 w-4" />,
    color: 'bg-gray-100 text-gray-600',
  };

  const entityLabel = activity.entity_type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="relative flex gap-4">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-[17px] top-10 bottom-0 w-0.5 bg-gray-200" />
      )}

      {/* Icon */}
      <div
        className={cn(
          'relative z-10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full',
          typeConfig.color,
        )}
      >
        {typeConfig.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-6">
        <p className="text-sm text-gray-900">{activity.summary}</p>
        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
          <span className="inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">
            {entityLabel}
          </span>
          {activity.user_id && (
            <span className="text-gray-400">•</span>
          )}
          {activity.user_id && (
            <span className="truncate">
              {String(activity.metadata?.user_name ?? activity.user_id)}
            </span>
          )}
          <span className="text-gray-400">•</span>
          <span>{timeAgo(activity.timestamp)}</span>
        </div>
      </div>
    </div>
  );
};
