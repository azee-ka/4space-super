import type { Conversation } from '@4space/shared/src/services/conversations.service';
import { stripHtml } from './validation';

export function getPrimaryParticipant(conversation: Conversation, currentUserId?: string | null) {
  const participants = conversation.participants || [];
  return participants.find((participant) => participant.user_id !== currentUserId) || participants[0] || null;
}

export function getConversationTitle(conversation: Conversation, currentUserId?: string | null) {
  if (conversation.is_group) {
    if (conversation.name && conversation.name.trim()) return conversation.name;
    const names = (conversation.participants || [])
      .filter((participant) => participant.user_id !== currentUserId)
      .map((participant) => participant.user?.display_name || participant.user?.username || 'Unknown');
    return names.slice(0, 3).join(', ') || 'Group conversation';
  }

  const participant = getPrimaryParticipant(conversation, currentUserId);
  return participant?.user?.display_name || participant?.user?.username || 'Direct message';
}

export function getConversationSubtitle(conversation: Conversation, currentUserId?: string | null) {
  if (conversation.last_message?.content) {
    const text = stripHtml(conversation.last_message.content);
    if (text) return text;
  }
  if (conversation.last_message?.message_type === 'image') return '📷 Photo';
  if (conversation.last_message?.message_type === 'file') return '📎 File';
  if (conversation.last_message?.message_type === 'voice') return '🎤 Voice message';
  if (conversation.is_group) {
    return `${(conversation.participants || []).length} members`;
  }
  const participant = getPrimaryParticipant(conversation, currentUserId);
  return participant?.user?.username || 'Say hello 👋';
}

export function buildLinkItems(messages: any[]) {
  return messages
    .filter((message) => message.message_type === 'text' && message.content)
    .flatMap((message) => {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const matches = message.content.match(urlRegex);
      if (!matches) return [];

      return matches.map((url: string) => ({
        id: `${message.id}-${url}`,
        url,
        title: url.length > 50 ? `${url.substring(0, 50)}...` : url,
        messageId: message.id,
        createdAt: message.created_at,
      }));
    })
    .slice(-20); // Keep last 20 links
}

export function buildFileItems(messages: any[]) {
  return messages
    .filter((message) => message.message_type === 'file' && message.metadata?.filename)
    .map((message) => ({
      id: message.id,
      filename: message.metadata.filename,
      size: message.metadata.size || 0,
      type: message.metadata.filetype || 'unknown',
      url: message.metadata.url,
      createdAt: message.created_at,
    }))
    .slice(-20); // Keep last 20 files
}

export function isSingleEmoji(text: string): boolean {
  if (!text || text.length === 0) return false;

  const trimmed = text.trim();
  if (trimmed.length === 0) return false;

  // Check if it's a single emoji (basic check)
  const emojiRegex = /^[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]+$/u;
  return emojiRegex.test(trimmed) && trimmed.length <= 3;
}