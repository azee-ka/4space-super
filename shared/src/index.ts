// shared/src/index.ts

// Types
export * from './types';

// Services
export { SpacesService } from './services/spaces.service';
export type {
  CreateSpaceInput,
  UpdateSpaceInput,
  SpaceStats,
} from './services/spaces.service';

export { RealtimeService } from './services/realtime.service';
// export type {
//   Message,
//   MessageReaction,
//   ReadReceipt,
//   TypingIndicator,
//   OnlineStatus,
// } from './services/realtime.service';
export * from './services/messages.service';
export type { Room, Message, RoomMember, MessageReaction } from './services/messages.service';


// Hooks
export { createSpaceHooks, spaceKeys } from './hooks/useSpaces';

export * from './hooks/useMessages';
export * from './hooks/useRealtime';
export { createMessageHooks, messageKeys } from './hooks/useMessages';




// Utilities
export { EncryptionService } from './utils/encryption';