// Modern DM Chat Interface - Clean Card Style
// web/src/pages/GeneralChat.tsx

import { useCallback, useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSlidersH, faPhone, faVideo,
  faUsers, faSearch, faTimes, faMagnifyingGlass, faUser,
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { LeftSidebar } from '../components/chat/LeftSidebar';
import { RightSidebar } from '../components/chat/RightSidebar';
import { MessageInput } from '../components/spaces/chat/centerPanel/MessageInput';
import { MessagesList } from '../components/spaces/chat/centerPanel/MessagesList';
import { PinnedBanner } from '../components/spaces/chat/centerPanel/PinnedBanner';
import { supabase } from '../lib/supabase';
import { getPrimaryParticipant, getConversationTitle } from '../components/chat/utils/chatUtils';
import { useRealtimeConversation } from '../hooks/useRealtime';
import {
  useAddConversationReaction,
  useConversations,
  useConversationMessages,
  useCreateDirectConversation,
  useCreateGroupConversation,
  useDeleteConversationMessage,
  useMarkConversationAsRead,
  usePinnedConversationMessages,
  usePinConversationMessage,
  useRemoveConversationReaction,
  useSearchUsers,
  useSendConversationMessage,
  useUpdateConversationMessage,
} from '../hooks/useConversations';
import { useAuthStore } from '../store/authStore';
import { useChatSettingsStore } from '../store/chatSettingsStore';
import { useChatSettingsSync } from '../hooks/useChatSettingsSync';
import { getBackgroundStyle } from '../utils/themeUtils';
import { useBackgroundSizing, useShouldUseMirroredBackground } from '../hooks/useWindowSize';
import type { SearchUserResult } from '@4space/shared/src/services/conversations.service';
import type { Message } from '@4space/shared/src/services/messages.service';
import { buildLinkItems } from '../components/chat/utils/chatUtils';
import { buildFileItems } from '../components/chat/utils/chatUtils';
import { isSingleEmoji } from '../components/chat/utils/chatUtils';
import type { ChatTheme } from '@4space/shared/src/types/chatSettings';
// ====================================
// MAIN COMPONENT - Space Chat Replica for DMs
// ====================================

export function GeneralChat() {
  useChatSettingsSync();

  const { user } = useAuthStore();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [leftSidebarTab, setLeftSidebarTab] = useState<'conversations' | 'metrics' | 'productivity' | 'reminders' | 'notes'>('conversations');
  const [rightSidebarTab, setRightSidebarTab] = useState<'settings' | 'metrics' | 'media' | 'links' | 'customization'>('metrics');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'unread' | 'favorites' | 'muted'>('all');
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatMode, setNewChatMode] = useState<'direct' | 'group'>('direct');
  const [newChatQuery, setNewChatQuery] = useState('');
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<SearchUserResult[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [muted, setMuted] = useState<Set<string>>(new Set());
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [activeCollection, setActiveCollection] = useState('Quick Notes');
  const [isMobile, setIsMobile] = useState(false);
  const [showThread, setShowThread] = useState(false);

  const {
    showTimestamps,
    showReadReceipts,
    showAvatars,
    showUsernames,
    showMessageStatus,
    showTypingIndicator,
    showOnlineStatus,
    screenSecurity,
    messageDensity,
    fontSize,
    theme,
    messageAnimations,
    autoScrollToBottom,
    reduceAnimations,
    groupMessages,
    setTheme,
    updateSettings,
  } = useChatSettingsStore();

  const getSettingsForRoom = useChatSettingsStore((state) => state.getSettingsForRoom);

  const { data: conversations = [], isLoading: loadingConversations } = useConversations();
  const { data: messagesData, isLoading: loadingMessages, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useConversationMessages(selectedConversationId || undefined);
  const { data: pinnedMessages = [] } = usePinnedConversationMessages(selectedConversationId || undefined);

  const { data: searchResults = [] } = useSearchUsers(newChatQuery.trim());

  const createDirectConversation = useCreateDirectConversation();
  const createGroupConversation = useCreateGroupConversation();
  const sendMessage = useSendConversationMessage();
  const updateMessage = useUpdateConversationMessage();
  const deleteMessage = useDeleteConversationMessage();
  const pinConversationMessage = usePinConversationMessage();
  const addReaction = useAddConversationReaction();
  const removeReaction = useRemoveConversationReaction();
  const markConversationAsRead = useMarkConversationAsRead();

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId) || null,
    [conversations, selectedConversationId]
  );

  const vaultConversation = useMemo(() => {
    return conversations.find((conversation) =>
      conversation.is_group &&
      conversation.name?.toLowerCase() === 'vault' &&
      (conversation.participants?.length || 0) <= 2
    );
  }, [conversations]);

  const messages = useMemo(() => messagesData?.pages.slice().reverse().flat() || [], [messagesData]);

  const normalizedMessages: Message[] = useMemo(() => {
    return messages.map((message: any) => ({
      ...message,
      room_id: message.conversation_id,
      space_id: message.conversation_id,
      is_pinned: message.is_pinned ?? false,
      is_system: message.is_system ?? false,
      updated_at: message.updated_at || message.created_at,
    })) as Message[];
  }, [messages]);

  const linkItems = useMemo(() => buildLinkItems(normalizedMessages), [normalizedMessages]);
  const fileItems = useMemo(() => buildFileItems(normalizedMessages), [normalizedMessages]);
  const mediaItems = useMemo(() => {
    return normalizedMessages
      .filter((message) => message.message_type === 'image' && message.metadata?.url)
      .slice(-12)
      .reverse();
  }, [normalizedMessages]);

  const overviewMetrics = useMemo(() => {
    return {
      messages: normalizedMessages.length,
      media: mediaItems.length,
      links: linkItems.length,
      files: fileItems.length,
      lastActive: selectedConversation?.last_message_at || selectedConversation?.updated_at || selectedConversation?.created_at,
    };
  }, [normalizedMessages.length, mediaItems.length, linkItems.length, fileItems.length, selectedConversation]);

  const { typingUsers, onlineUsers, sendTypingIndicator, stopTyping } = useRealtimeConversation(
    supabase as any,
    selectedConversationId || undefined,
    user?.id,
    !!selectedConversationId
  );

  const handleToggleFavorite = (conversationId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(conversationId)) {
        next.delete(conversationId);
      } else {
        next.add(conversationId);
      }
      return next;
    });
  };

  const handleToggleMute = (conversationId: string) => {
    setMuted((prev) => {
      const next = new Set(prev);
      if (next.has(conversationId)) {
        next.delete(conversationId);
      } else {
        next.add(conversationId);
      }
      return next;
    });
  };

  const handleSendMessage = useCallback(
    (content: string, type: string = 'text', attachments: any[] = []) => {
      if (!selectedConversationId) return;
      const trimmed = content.trim();
      if (!trimmed && attachments.length === 0) return;

      if (editingMessage) {
        updateMessage.mutate(
          { messageId: editingMessage.id, content: trimmed },
          { onSuccess: () => setEditingMessage(null) }
        );
        return;
      }

      const metadata: any = {
        ...(vaultConversation?.id === selectedConversationId ? { collection: activeCollection } : {}),
      };

      if (isSingleEmoji(trimmed)) {
        metadata.isSingleEmoji = true;
      }

      sendMessage.mutate(
        {
          conversation_id: selectedConversationId,
          content: trimmed,
          message_type: type,
          reply_to_id: replyTo?.id || null,
          attachments,
          metadata,
        },
        {
          onSuccess: () => setReplyTo(null),
        }
      );
    },
    [selectedConversationId, editingMessage, replyTo, vaultConversation, activeCollection]
  );

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setShowThread(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  useEffect(() => {
    if (!selectedConversationId) return;
    const lastMessage = normalizedMessages[normalizedMessages.length - 1];
    if (!lastMessage || lastMessage.sender_id !== user?.id) {
      markConversationAsRead.mutate(selectedConversationId);
    }
  }, [normalizedMessages, selectedConversationId]);


  const shouldUseMirror = useShouldUseMirroredBackground();
  const { tileCount, imageHeight } = useBackgroundSizing();


  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setShowThread(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);


  const conversationAppearance = getSettingsForRoom(selectedConversationId || undefined);
  const activeTheme: ChatTheme = conversationAppearance.theme || theme;
  const centerPanelBackgroundStyle = getBackgroundStyle(activeTheme);

  const filteredConversations = useMemo(() => {
    const filtered = conversations.filter((conversation) => {
      if (filterMode === 'unread' && !(conversation.unread_count && conversation.unread_count > 0)) {
        return false;
      }
      if (filterMode === 'favorites' && !favorites.has(conversation.id)) return false;
      if (filterMode === 'muted' && !muted.has(conversation.id)) return false;
      if (!searchQuery.trim()) return true;
      const title = getConversationTitle(conversation, user?.id);
      return title.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return filtered.sort((a, b) => {
      if (favorites.has(a.id) && !favorites.has(b.id)) return -1;
      if (!favorites.has(a.id) && favorites.has(b.id)) return 1;
      const aTime = new Date(a.last_message_at || a.updated_at || a.created_at).getTime();
      const bTime = new Date(b.last_message_at || b.updated_at || b.created_at).getTime();
      return bTime - aTime;
    });
  }, [conversations, filterMode, searchQuery, user?.id, favorites]);

  const handleOpenConversation = useCallback(
    (conversationId: string) => {
      setSelectedConversationId(conversationId);
      if (isMobile) {
        setShowThread(true);
      }
    },
    [isMobile]
  );

  const handleOpenVault = async () => {
    if (vaultConversation) {
      handleOpenConversation(vaultConversation.id);
      return;
    }

    try {
      const conversation = await createGroupConversation.mutateAsync({
        name: 'Vault',
        participant_ids: [],
      });
      handleOpenConversation(conversation.id);
    } catch (error) {
      console.error('Failed to create vault:', error);
    }
  };


  const handleDeleteMessage = useCallback(
    (messageId: string, deleteForEveryone: boolean = false) => {
      if (!confirm(deleteForEveryone ? 'Delete this message for everyone?' : 'Delete this message?')) return;
      deleteMessage.mutate(messageId);
    },
    []
  );

  const handlePinMessage = useCallback(
    (messageId: string, options: { pin: boolean; pinnedUntil?: string | null; keep?: boolean }) => {
      pinConversationMessage.mutate({
        messageId,
        pin: options.pin,
        pinnedUntil: options.pinnedUntil,
        keep: options.keep,
      });
    },
    []
  );

  const handleReaction = useCallback(
    (messageId: string, reaction: string) => {
      addReaction.mutate({ messageId, reaction });
    },
    []
  );

  const handleRemoveReaction = useCallback(
    (messageId: string, reaction: string) => {
      removeReaction.mutate({ messageId, reaction });
    },
    []
  );

  const handleCloseNewChat = () => {
    setShowNewChat(false);
    setNewChatQuery('');
    setGroupName('');
    setSelectedUsers([]);
    setNewChatMode('direct');
  };

  const handleSelectUser = async (userResult: SearchUserResult) => {
    if (newChatMode === 'direct') {
      try {
        const conversation = await createDirectConversation.mutateAsync(userResult.id);
        handleOpenConversation(conversation.id);
        handleCloseNewChat();
      } catch (error) {
        console.error('Failed to start direct conversation:', error);
      }
      return;
    }

    setSelectedUsers((prev) => {
      const exists = prev.some((entry) => entry.id === userResult.id);
      if (exists) {
        return prev.filter((entry) => entry.id !== userResult.id);
      }
      return [...prev, userResult];
    });
  };

  const handleCreateGroup = async () => {
    const trimmedName = groupName.trim();
    if (!trimmedName || selectedUsers.length === 0) return;

    try {
      const conversation = await createGroupConversation.mutateAsync({
        name: trimmedName,
        participant_ids: selectedUsers.map((participant) => participant.id),
      });
      handleOpenConversation(conversation.id);
      handleCloseNewChat();
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };


  const selectedParticipant = selectedConversation
    ? getPrimaryParticipant(selectedConversation, user?.id)
    : null;
  const isParticipantOnline = selectedParticipant
    ? onlineUsers.has(selectedParticipant.user_id)
    : false;

  // ====================================
  // RENDER: Space Chat Replica Layout
  // ====================================

  return (
    <div className="h-screen flex bg-black">
      {/* LEFT SIDEBAR - Space Chat Replica */}
      <LeftSidebar
        conversations={conversations}
        selectedConversationId={selectedConversationId || undefined}
        onSelectConversation={setSelectedConversationId}
        activeTab={leftSidebarTab}
        onTabChange={setLeftSidebarTab}
        isLoading={loadingConversations}
        onlineUsers={onlineUsers}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterMode={filterMode}
        onFilterChange={setFilterMode}
        favorites={favorites}
        muted={muted}
        onToggleFavorite={handleToggleFavorite}
        onToggleMute={handleToggleMute}
        user={user}
        typingUsers={typingUsers}
      />

      {/* CENTER PANEL - Messages */}
      {selectedConversationId && (
        <div className="flex-1 flex flex-col" style={centerPanelBackgroundStyle}>
          {/* Background Tiles */}
          {activeTheme.backgroundType === 'featured' && activeTheme.backgroundImage && (
            <div className="absolute inset-0 pointer-events-none -z-10 flex flex-nowrap overflow-hidden">
              {[...Array(shouldUseMirror ? tileCount * 2 : tileCount)].map((_, i) => {
                const useMirrorImage = shouldUseMirror && i % 2 === 1;
                const imageSrc = useMirrorImage
                  ? activeTheme.backgroundImage?.replace('/src/assets/chat_themes_3/', '/src/assets/chat_themes_3_mirror/')
                  : activeTheme.backgroundImage;

                return (
                  <img
                    key={i}
                    src={imageSrc}
                    alt=""
                    className="flex-shrink-0"
                    style={{
                      height: imageHeight,
                      width: 'auto',
                      objectFit: 'cover',
                      objectPosition: 'center',
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/50">
            <div className="flex items-center gap-3">
              {selectedConversation && (
                <>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center font-bold text-white">
                    {selectedConversation.is_group ? (
                      <FontAwesomeIcon icon={faUsers} />
                    ) : (
                      ((selectedConversation ? getConversationTitle(selectedConversation, user?.id) : 'U')[0] || 'U').toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">
                      {getConversationTitle(selectedConversation, user?.id)}
                    </p>
                    <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                      {selectedConversation.is_group
                        ? `${selectedConversation.participants?.length || 0} members`
                        : isParticipantOnline
                          ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              Online
                            </>
                          )
                          : 'Offline'}
                    </p>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 rounded-lg bg-zinc-800/50 hover:bg-zinc-800/70 flex items-center justify-center transition-colors">
                <FontAwesomeIcon icon={faPhone} className="text-emerald-400" />
              </button>
              <button className="w-9 h-9 rounded-lg bg-zinc-800/50 hover:bg-zinc-800/70 flex items-center justify-center transition-colors">
                <FontAwesomeIcon icon={faVideo} className="text-violet-400" />
              </button>
              <button className="w-9 h-9 rounded-lg bg-zinc-800/50 hover:bg-zinc-800/70 flex items-center justify-center transition-colors">
                <FontAwesomeIcon icon={faSlidersH} className="text-cyan-400" />
              </button>
            </div>
          </div>

          {/* Pinned Banner */}
          {pinnedMessages.length > 0 && (
            <PinnedBanner
              pinnedMessages={pinnedMessages.map((message: any) => ({
                ...message,
                room_id: message.conversation_id,
                space_id: message.conversation_id,
                is_pinned: message.is_pinned ?? false,
                is_system: message.is_system ?? false,
                updated_at: message.updated_at || message.created_at,
              })) as Message[]}
              onScrollToMessage={(messageId: string) => console.log('Scroll to:', messageId)}
            />
          )}

          {/* Messages */}
              <div className="flex-1 overflow-hidden">
                <MessagesList
                  messages={normalizedMessages}
                  currentUserId={user?.id}
                  onLoadMore={fetchNextPage}
                  hasMore={hasNextPage}
                  isLoading={loadingMessages}
                  isFetchingMore={isFetchingNextPage}
                  onReply={setReplyTo}
                  onEdit={setEditingMessage}
                  onDelete={handleDeleteMessage}
                  onPin={handlePinMessage}
              onBookmark={(messageId) => console.log('Bookmark:', messageId)}
                  onReaction={handleReaction}
                  onRemoveReaction={handleRemoveReaction}
                  theme={conversationAppearance.theme || theme}
                  fontSize={conversationAppearance.fontSize || fontSize}
                  messageDensity={conversationAppearance.messageDensity || messageDensity}
                  typingUsers={typingUsers}
                  showAvatars={showAvatars}
                  showUsernames={showUsernames}
                  showTimestamps={showTimestamps}
                  showReadReceipts={showReadReceipts}
                  showMessageStatus={showMessageStatus}
                  enableMessageReactions
                  enableMessageReplies
                  enableMessageForwarding
                  allowMessageEditing
                  allowMessageDeletion
                  allowMessagePinning
                  groupMessages={groupMessages}
                  autoScrollToBottom={autoScrollToBottom}
                  messageAnimations={messageAnimations}
                  reduceAnimations={reduceAnimations}
                />
              </div>

              {/* Message Input */}
          <div className="px-6 py-4 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-800/50">
                <MessageInput
                  onSend={handleSendMessage}
                  onTyping={() => {
                    if (showTypingIndicator) {
                      sendTypingIndicator();
                    }
                  }}
                  onStopTyping={() => {
                    if (showTypingIndicator) {
                      stopTyping();
                    }
                  }}
                  replyTo={replyTo}
                  onCancelReply={() => setReplyTo(null)}
                  editingMessage={editingMessage}
                  onCancelEdit={() => setEditingMessage(null)}
              placeholder={`Message ${selectedConversation ? getConversationTitle(selectedConversation, user?.id) : 'conversation'}...`}
                  allowFileUploads
                />
              </div>
        </div>
      )}

      {/* RIGHT SIDEBAR - Space Chat Replica */}
      {selectedConversationId && (
        <RightSidebar
          activeTab={rightSidebarTab}
          onTabChange={setRightSidebarTab}
          theme={activeTheme}
          onThemeChange={setTheme}
          messages={normalizedMessages}
          selectedConversation={selectedConversation || undefined}
          onlineUsers={onlineUsers}
          mediaItems={mediaItems}
          linkItems={linkItems}
        />
      )}

      {/* New Chat Modal */}
      <AnimatePresence>
        {showNewChat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={handleCloseNewChat}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl bg-zinc-900 p-6"
            >
              <button
                className="absolute right-6 top-6 w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
                onClick={handleCloseNewChat}
              >
                <FontAwesomeIcon icon={faTimes} className="text-white" />
              </button>

              <div className="mb-5">
                <h3 className="text-xl font-bold text-white mb-2">New Conversation</h3>
                <p className="text-sm text-zinc-400">Find someone to message</p>
              </div>

              <div className="mb-4 flex gap-3">
                {['direct', 'group'].map((mode) => (
                  <button
                    key={mode}
                    className={`flex-1 p-3 rounded-xl text-sm font-bold transition-all duration-200 border ${
                      newChatMode === mode
                        ? 'bg-zinc-800 text-white border-zinc-600'
                        : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white border-zinc-800 hover:border-zinc-700'
                    }`}
                    onClick={() => setNewChatMode(mode as 'direct' | 'group')}
                  >
                    <FontAwesomeIcon icon={mode === 'direct' ? faUser : faUsers} className="mr-2" />
                    {mode === 'direct' ? 'Direct' : 'Group'}
                  </button>
                ))}
              </div>

              <div className="relative mb-4">
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                />
                <input
                  value={newChatQuery}
                  onChange={(e) => setNewChatQuery(e.target.value)}
                  placeholder="Search users..."
                  className="w-full pl-11 pr-4 py-3 bg-zinc-900 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>

              <div className="max-h-80 space-y-2 overflow-y-auto">
                {newChatQuery.trim().length === 0 && (
                  <div className="p-8 text-center text-sm text-zinc-400">
                    <FontAwesomeIcon icon={faSearch} className="text-3xl mb-3 text-zinc-700" />
                    <p>Search for users</p>
                  </div>
                )}

                {newChatQuery.trim().length > 0 && searchResults.length === 0 && (
                  <div className="p-8 text-center text-sm text-zinc-400">
                    <p>No results found</p>
                  </div>
                )}

                {searchResults.map((result) => {
                  const isSelected = selectedUsers.some((entry) => entry.id === result.id);
                  return (
                    <button
                      key={result.id}
                      onClick={() => handleSelectUser(result)}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-200 border ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-500/50'
                          : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-xl bg-zinc-800 flex items-center justify-center font-bold text-white">
                        {(result.display_name || result.username || 'U')[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-bold text-white">
                          {result.display_name || result.username || 'Unknown'}
                        </p>
                        <p className="text-xs text-zinc-400">{result.username || result.email}</p>
                      </div>
                      {newChatMode === 'direct' ? (
                        <span className="text-xs font-bold text-zinc-400">Start</span>
                      ) : (
                        <span className={`text-xs font-bold ${isSelected ? 'text-emerald-400' : 'text-zinc-400'}`}>
                          {isSelected ? 'Added' : 'Add'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {newChatMode === 'group' && (
                <button
                  className="mt-4 w-full p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!groupName.trim() || selectedUsers.length === 0}
                  onClick={handleCreateGroup}
                >
                  Create Group
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

