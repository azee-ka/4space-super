# 4Space Mobile App

A modern, feature-rich mobile messaging application built with React Native, Expo, and Supabase. This app provides a WhatsApp-style chat experience with real-time messaging, file sharing, reactions, and more.

## Features

### Authentication
- Email/password sign up and login
- Secure token storage with Expo SecureStore
- Session persistence across app restarts
- Auto-redirect based on auth status

### Messaging (Fully Functional)
- Real-time messaging with instant updates
- WhatsApp-style message bubbles
- Message read receipts (single/double check marks)
- Message reactions with emoji picker
- Reply to messages
- File attachments (images, videos, documents)
- Typing indicators
- Message editing indicators
- Conversation list with unread counts
- Search conversations
- Infinite scroll message history

### Navigation
- Bottom tab navigation with 4 tabs:
  - **Dashboard**: Overview with quick stats
  - **Messages**: Full-featured chat (primary focus)
  - **Spaces**: Team collaboration spaces (placeholder)
  - **Settings**: Profile and app settings

### UI/UX
- Dark mode only (optimized for OLED)
- Beautiful gradients and animations
- Smooth transitions and interactions
- Touch-optimized components
- Keyboard-aware layouts
- Native feel on iOS and Android

## Tech Stack

- **Framework**: React Native + Expo SDK 54
- **Routing**: Expo Router v6 (file-based routing)
- **Styling**: NativeWind v4 (Tailwind CSS for React Native)
- **State Management**: Zustand v5
- **Data Fetching**: TanStack React Query v5
- **Backend**: Supabase (PostgreSQL + Realtime)
- **Real-time**: Supabase Realtime (WebSocket)
- **Storage**: Supabase Storage (file uploads)
- **Auth**: Supabase Auth (JWT tokens)

## Project Structure

```
mobile/
├── app/                          # Expo Router pages
│   ├── (tabs)/                   # Tab navigation group
│   │   ├── index.tsx            # Dashboard screen
│   │   ├── messages/
│   │   │   ├── index.tsx        # Conversation list
│   │   │   └── [id].tsx         # Individual chat screen
│   │   ├── spaces/
│   │   │   └── index.tsx        # Spaces list
│   │   └── settings/
│   │       └── index.tsx        # Settings screen
│   ├── _layout.tsx              # Root layout (auth guard)
│   ├── index.tsx                # Entry redirect
│   ├── login.tsx                # Login screen
│   └── signup.tsx               # Signup screen
├── src/
│   ├── components/
│   │   ├── ui/                  # Reusable UI components
│   │   │   ├── Avatar.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── IconButton.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   └── chat/                # Chat-specific components
│   │       ├── MessageBubble.tsx
│   │       ├── MessageInput.tsx
│   │       ├── ConversationItem.tsx
│   │       └── TypingIndicator.tsx
│   ├── store/                   # Zustand stores
│   │   ├── authStore.ts         # Auth state
│   │   └── chatStore.ts         # Chat state
│   ├── hooks/                   # Custom React hooks
│   │   └── useConversations.ts  # Messaging hooks
│   ├── lib/                     # Configuration
│   │   ├── supabase.ts          # Supabase client
│   │   └── queryClient.ts       # React Query setup
│   ├── types/                   # TypeScript types
│   │   └── index.ts
│   └── utils/                   # Utility functions
├── assets/                      # Images and icons
├── tailwind.config.js          # Tailwind configuration
├── app.json                    # Expo configuration
├── package.json
├── global.css                  # NativeWind styles
└── README.md

```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI: `npm install -g expo-cli` or use `npx expo`
- iOS: Xcode (macOS only)
- Android: Android Studio
- Expo Go app (for quick testing)

### Installation

1. **Navigate to mobile directory**:
   ```bash
   cd mobile
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**:
   
   Create a `.env` file in the mobile directory:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   Get these values from your Supabase project settings.

4. **Set up Supabase Database**:
   
   Your database should have these tables (match your web app schema):
   - `profiles` - User profiles
   - `conversations` - Chat conversations
   - `conversation_participants` - Conversation members
   - `messages` - Chat messages
   - `message_reactions` - Message reactions

5. **Configure Supabase Storage**:
   
   Create a storage bucket named `message-files` for file attachments.

### Running the App

**Start the development server**:
```bash
npx expo start
```

**Run on specific platforms**:
```bash
# iOS Simulator (macOS only)
npx expo start --ios

# Android Emulator
npx expo start --android

# Web browser
npx expo start --web
```

**Using Expo Go** (easiest for testing):
1. Install Expo Go from App Store (iOS) or Play Store (Android)
2. Scan the QR code from the terminal
3. App will load on your device

### Building for Production

**iOS**:
```bash
eas build --platform ios
```

**Android**:
```bash
eas build --platform android
```

Note: You'll need an Expo account and EAS CLI configured.

## Key Features Implementation

### Real-time Messaging

The app uses Supabase Realtime for instant message delivery:

```typescript
// Subscribe to new messages in a conversation
const channel = supabase.channel('room:' + conversationId);
channel
  .on('postgres_changes', { 
    event: 'INSERT', 
    schema: 'public', 
    table: 'messages',
    filter: 'conversation_id=eq.' + conversationId 
  }, (payload) => {
    // Handle new message
  })
  .subscribe();
```

### Typing Indicators

Real-time typing indicators using Supabase broadcast:

```typescript
// Send typing indicator
channel.send({
  type: 'broadcast',
  event: 'typing',
  payload: { userId, user }
});

// Receive typing indicators
channel.on('broadcast', { event: 'typing' }, (payload) => {
  // Show typing indicator
});
```

### File Uploads

Files are uploaded to Supabase Storage:

```typescript
// Upload file
const { data } = await supabase.storage
  .from('message-files')
  .upload(filePath, fileBlob);

// Get public URL
const { data: urlData } = supabase.storage
  .from('message-files')
  .getPublicUrl(filePath);
```

### Message Reactions

Users can react to messages with emoji:

```typescript
await supabase
  .from('message_reactions')
  .insert({
    message_id: messageId,
    user_id: userId,
    emoji: emoji,
  });
```

## Customization

### Colors

Edit [tailwind.config.js](tailwind.config.js:1-77) to customize the color scheme:

```javascript
colors: {
  primary: { ... },
  sent: { bg: '#0284c7', text: '#ffffff' },
  received: { bg: '#27272a', text: '#e4e4e7' },
}
```

### Message Bubble Style

Edit [MessageBubble.tsx](src/components/chat/MessageBubble.tsx) to change bubble appearance.

### Navigation

Modify [app/(tabs)/_layout.tsx](app/(tabs)/_layout.tsx) to add/remove tabs or change icons.

## Database Schema

### Required Tables

**profiles**:
```sql
- id (uuid, primary key)
- email (text)
- username (text, unique)
- display_name (text)
- avatar_url (text)
- created_at (timestamp)
```

**conversations**:
```sql
- id (uuid, primary key)
- type (text: 'dm' | 'group')
- name (text, nullable)
- avatar_url (text, nullable)
- created_at (timestamp)
- updated_at (timestamp)
```

**messages**:
```sql
- id (uuid, primary key)
- conversation_id (uuid, foreign key)
- sender_id (uuid, foreign key)
- content (text)
- type (text: 'text' | 'image' | 'file' | 'video')
- reply_to_id (uuid, nullable)
- file_url (text, nullable)
- file_name (text, nullable)
- read_by (text[], array of user IDs)
- is_edited (boolean)
- is_deleted (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

**message_reactions**:
```sql
- id (uuid, primary key)
- message_id (uuid, foreign key)
- user_id (uuid, foreign key)
- emoji (text)
- created_at (timestamp)
```

## Troubleshooting

### Module Resolution Issues

If you see "Unable to resolve module" errors:
```bash
rm -rf node_modules
npm install
npx expo start --clear
```

### Metro Bundler Issues

Clear the cache:
```bash
npx expo start --clear
```

### Environment Variables Not Loading

Make sure your `.env` file is in the mobile directory and restart the dev server.

### Supabase Connection Issues

Verify your Supabase URL and anon key are correct in `.env`.

## Performance Tips

1. **Message Pagination**: Currently loads 100 messages. Implement infinite scroll for better performance with large conversations.

2. **Image Optimization**: Compress images before uploading using expo-image-manipulator.

3. **Offline Support**: Consider implementing offline message queue with local storage.

4. **Message Virtualization**: For very long conversations, use FlashList instead of FlatList.

## Next Steps

The messaging functionality is fully implemented. Consider adding:

- [ ] Voice messages
- [ ] Video calls (WebRTC integration)
- [ ] Message search
- [ ] Group chat management
- [ ] Push notifications
- [ ] Message forwarding
- [ ] Chat export
- [ ] End-to-end encryption
- [ ] Spaces functionality
- [ ] File previews

## Contributing

This is part of the 4Space project. Follow the same patterns established in the web app for consistency.

## License

Private project - All rights reserved

---

**Built with ❤️ using React Native and Expo**
