import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export type NoteCategory = 'personal' | 'work' | 'ideas' | 'todo' | 'meeting' | 'project' | 'learning' | 'creative';

export interface Note {
  id: string;
  space_id: string;
  title: string;
  content: string;
  category: NoteCategory;
  color: string;
  author_id: string;
  tags: string[];
  pinned: boolean;
  starred: boolean;
  shared: boolean;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  checklist?: NoteChecklistItem[];
}

export interface NoteChecklistItem {
  id: string;
  note_id: string;
  text: string;
  completed: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteInput {
  space_id: string;
  title: string;
  content: string;
  category: NoteCategory;
  color?: string;
  tags?: string[];
  pinned?: boolean;
  starred?: boolean;
  shared?: boolean;
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  category?: NoteCategory;
  color?: string;
  tags?: string[];
  pinned?: boolean;
  starred?: boolean;
  shared?: boolean;
}

// Fetch notes for a space
export function useNotes(spaceId: string | undefined) {
  return useQuery({
    queryKey: ['notes', spaceId],
    queryFn: async () => {
      if (!spaceId) return [];

      const { data, error } = await supabase
        .from('notes')
        .select(`
          *,
          checklist:note_checklists(*)
        `)
        .eq('space_id', spaceId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as Note[];
    },
    enabled: !!spaceId,
  });
}

// Fetch a single note
export function useNote(noteId: string | undefined) {
  return useQuery({
    queryKey: ['note', noteId],
    queryFn: async () => {
      if (!noteId) return null;

      const { data, error } = await supabase
        .from('notes')
        .select(`
          *,
          checklist:note_checklists(*)
        `)
        .eq('id', noteId)
        .single();

      if (error) throw error;
      return data as Note;
    },
    enabled: !!noteId,
  });
}

// Create a note
export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateNoteInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('notes')
        .insert({
          ...input,
          author_id: user.id,
        })
        .select(`
          *,
          checklist:note_checklists(*)
        `)
        .single();

      if (error) throw error;
      return data as Note;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notes', data.space_id] });
    },
  });
}

// Update a note
export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ noteId, input }: { noteId: string; input: UpdateNoteInput }) => {
      const { data, error } = await supabase
        .from('notes')
        .update(input)
        .eq('id', noteId)
        .select(`
          *,
          checklist:note_checklists(*)
        `)
        .single();

      if (error) throw error;
      return data as Note;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notes', data.space_id] });
      queryClient.invalidateQueries({ queryKey: ['note', data.id] });
    },
  });
}

// Delete a note
export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
      return noteId;
    },
    onSuccess: (_, noteId) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.removeQueries({ queryKey: ['note', noteId] });
    },
  });
}

// Create checklist item
export function useCreateChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ noteId, text }: { noteId: string; text: string }) => {
      // Get the current max position
      const { data: items } = await supabase
        .from('note_checklists')
        .select('position')
        .eq('note_id', noteId)
        .order('position', { ascending: false })
        .limit(1);

      const position = items && items.length > 0 ? items[0].position + 1 : 0;

      const { data, error } = await supabase
        .from('note_checklists')
        .insert({
          note_id: noteId,
          text,
          position,
        })
        .select()
        .single();

      if (error) throw error;
      return data as NoteChecklistItem;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['note', data.note_id] });
    },
  });
}

// Update checklist item
export function useUpdateChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      noteId,
      completed,
      text,
    }: {
      itemId: string;
      noteId: string;
      completed?: boolean;
      text?: string;
    }) => {
      const updates: Partial<NoteChecklistItem> = {};
      if (completed !== undefined) updates.completed = completed;
      if (text !== undefined) updates.text = text;

      const { data, error } = await supabase
        .from('note_checklists')
        .update(updates)
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;
      return { data: data as NoteChecklistItem, noteId };
    },
    onSuccess: ({ noteId }) => {
      queryClient.invalidateQueries({ queryKey: ['note', noteId] });
    },
  });
}

// Delete checklist item
export function useDeleteChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, noteId }: { itemId: string; noteId: string }) => {
      const { error } = await supabase
        .from('note_checklists')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      return noteId;
    },
    onSuccess: (noteId) => {
      queryClient.invalidateQueries({ queryKey: ['note', noteId] });
    },
  });
}
