import type { MessageRetention } from '../types/chatSettings';

const RETENTION_MS: Record<MessageRetention, number | null> = {
  forever: null,
  '1hour': 60 * 60 * 1000,
  '24hours': 24 * 60 * 60 * 1000,
  '1week': 7 * 24 * 60 * 60 * 1000,
  '1month': 30 * 24 * 60 * 60 * 1000,
  '6months': 180 * 24 * 60 * 60 * 1000,
  '1year': 365 * 24 * 60 * 60 * 1000,
};

const RETENTION_LABELS: Record<MessageRetention, string> = {
  forever: 'Off',
  '1hour': '1 hour',
  '24hours': '24 hours',
  '1week': '1 week',
  '1month': '1 month',
  '6months': '6 months',
  '1year': '1 year',
};

export function getMessageRetentionMs(retention: MessageRetention): number | null {
  return RETENTION_MS[retention] ?? null;
}

export function getMessageRetentionExpiresAt(
  retention: MessageRetention,
  from: Date = new Date()
): string | null {
  const ms = getMessageRetentionMs(retention);
  if (!ms) return null;
  return new Date(from.getTime() + ms).toISOString();
}

export function formatMessageRetention(retention: MessageRetention): string {
  return RETENTION_LABELS[retention] || retention;
}
