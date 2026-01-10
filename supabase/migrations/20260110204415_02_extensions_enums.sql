-- ╔════════════════════════════════════════════════════════════════╗
-- ║  STEP 2: EXTENSIONS & ENUMS                                    ║
-- ║  Create necessary extensions and custom types                  ║
-- ╚════════════════════════════════════════════════════════════════╝

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE space_type AS ENUM (
  'personal',
  'couple',
  'team',
  'portfolio',
  'community',
  'custom'
);

CREATE TYPE space_privacy AS ENUM (
  'private',
  'shared',
  'team',
  'public',
  'unlisted'
);

CREATE TYPE member_role AS ENUM (
  'owner',
  'admin',
  'editor',
  'commenter',
  'viewer'
);

CREATE TYPE message_type AS ENUM (
  'text',
  'file',
  'image',
  'video',
  'audio',
  'system'
);

CREATE TYPE invitation_status AS ENUM (
  'pending',
  'accepted',
  'rejected',
  'expired'
);

CREATE TYPE notification_type AS ENUM (
  'space_invitation',
  'member_joined',
  'member_left',
  'new_message',
  'mention',
  'system'
);

SELECT '✅ Step 2 Complete: Extensions and enums created' as status;