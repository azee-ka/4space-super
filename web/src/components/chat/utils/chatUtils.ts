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

export function calculateAverageResponseTime(messages: any[]): number {
  if (messages.length < 2) return 0;

  let totalResponseTime = 0;
  let responseCount = 0;

  // Group messages by user
  const messagesByUser: { [key: string]: any[] } = {};
  messages.forEach(msg => {
    if (!messagesByUser[msg.user_id]) {
      messagesByUser[msg.user_id] = [];
    }
    messagesByUser[msg.user_id].push(msg);
  });

  // Calculate response times between different users
  Object.values(messagesByUser).forEach(userMessages => {
    userMessages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    for (let i = 1; i < userMessages.length; i++) {
      const prevMsg = userMessages[i - 1];
      const currMsg = userMessages[i];
      const timeDiff = new Date(currMsg.created_at).getTime() - new Date(prevMsg.created_at).getTime();

      // Only count responses within reasonable time (under 24 hours)
      if (timeDiff < 24 * 60 * 60 * 1000) {
        totalResponseTime += timeDiff / (1000 * 60); // Convert to minutes
        responseCount++;
      }
    }
  });

  return responseCount > 0 ? Math.round(totalResponseTime / responseCount) : 0;
}

export function calculateConversationAge(conversation?: any): number {
  if (!conversation?.created_at) return 0;
  const created = new Date(conversation.created_at).getTime();
  const now = Date.now();
  return Math.floor((now - created) / (1000 * 60 * 60 * 24));
}

export function calculateActivityScore(messages: any[], conversation?: any): string {
  if (!conversation || messages.length === 0) return '0/10';

  const age = calculateConversationAge(conversation);
  const avgDaily = messages.length / Math.max(1, age);
  const participants = conversation.participants?.length || 1;

  // Simple scoring algorithm
  let score = 0;
  if (avgDaily >= 5) score += 3;
  else if (avgDaily >= 2) score += 2;
  else if (avgDaily >= 0.5) score += 1;

  if (participants >= 3) score += 2;
  else if (participants >= 2) score += 1;

  if (messages.length >= 50) score += 2;
  else if (messages.length >= 20) score += 1;

  // Recent activity bonus
  const lastMessage = messages[messages.length - 1];
  if (lastMessage) {
    const daysSinceLast = (Date.now() - new Date(lastMessage.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLast <= 1) score += 2;
    else if (daysSinceLast <= 7) score += 1;
  }

  return `${Math.min(score, 10)}/10`;
}