import React from 'react';
import {
  Calendar,
  DollarSign,
  XCircle,
  Users,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NotificationType } from '@brokerflow/shared';
import type { Notification } from '@brokerflow/shared';

const typeIconMap: Record<string, React.ReactNode> = {
  [NotificationType.renewal_upcoming]: <Calendar className="h-4 w-4 text-blue-500" />,
  [NotificationType.quote_received]: <DollarSign className="h-4 w-4 text-green-500" />,
  [NotificationType.submission_declined]: <XCircle className="h-4 w-4 text-red-500" />,
  [NotificationType.network_request]: <Users className="h-4 w-4 text-purple-500" />,
  [NotificationType.system_alert]: <Bell className="h-4 w-4 text-yellow-500" />,
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface NotificationItemProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClick,
}) => {
  const icon = typeIconMap[notification.type] || <Bell className="h-4 w-4 text-gray-400" />;

  return (
    <button
      onClick={() => onClick(notification)}
      className={cn(
        'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50',
        !notification.is_read && 'bg-blue-50/50',
      )}
    >
      <div className="mt-0.5 flex-shrink-0">{icon}</div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p
            className={cn(
              'text-sm truncate',
              notification.is_read ? 'text-gray-700' : 'font-semibold text-gray-900',
            )}
          >
            {notification.title}
          </p>
          {!notification.is_read && (
            <span className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
          )}
        </div>
        <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">
          {notification.message}
        </p>
        <p className="mt-1 text-xs text-gray-400">
          {timeAgo(notification.created_at)}
        </p>
      </div>
    </button>
  );
};
