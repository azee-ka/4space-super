-- Create notes table
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL CHECK (category IN ('personal', 'work', 'ideas', 'todo', 'meeting', 'project', 'learning', 'creative')),
    color TEXT NOT NULL DEFAULT 'from-violet-500 via-purple-500 to-fuchsia-500',
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tags TEXT[] DEFAULT '{}',
    pinned BOOLEAN DEFAULT false,
    starred BOOLEAN DEFAULT false,
    shared BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create note_checklists table for todo items within notes
CREATE TABLE IF NOT EXISTS public.note_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    completed BOOLEAN DEFAULT false,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notes_space_id ON public.notes(space_id);
CREATE INDEX IF NOT EXISTS idx_notes_author_id ON public.notes(author_id);
CREATE INDEX IF NOT EXISTS idx_notes_category ON public.notes(category);
CREATE INDEX IF NOT EXISTS idx_notes_pinned ON public.notes(pinned);
CREATE INDEX IF NOT EXISTS idx_notes_starred ON public.notes(starred);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON public.notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON public.notes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_tags ON public.notes USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_note_checklists_note_id ON public.note_checklists(note_id);

-- Enable RLS
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_checklists ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notes
CREATE POLICY "Users can view notes in spaces they are members of"
    ON public.notes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.space_members
            WHERE space_members.space_id = notes.space_id
            AND space_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create notes in spaces they are members of"
    ON public.notes FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.space_members
            WHERE space_members.space_id = notes.space_id
            AND space_members.user_id = auth.uid()
        )
        AND author_id = auth.uid()
    );

CREATE POLICY "Users can update their own notes"
    ON public.notes FOR UPDATE
    USING (author_id = auth.uid())
    WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can delete their own notes"
    ON public.notes FOR DELETE
    USING (author_id = auth.uid());

-- RLS Policies for note_checklists
CREATE POLICY "Users can view checklists for notes they can view"
    ON public.note_checklists FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.notes
            WHERE notes.id = note_checklists.note_id
            AND EXISTS (
                SELECT 1 FROM public.space_members
                WHERE space_members.space_id = notes.space_id
                AND space_members.user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can create checklists for their own notes"
    ON public.note_checklists FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.notes
            WHERE notes.id = note_checklists.note_id
            AND notes.author_id = auth.uid()
        )
    );

CREATE POLICY "Users can update checklists for their own notes"
    ON public.note_checklists FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.notes
            WHERE notes.id = note_checklists.note_id
            AND notes.author_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete checklists for their own notes"
    ON public.note_checklists FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.notes
            WHERE notes.id = note_checklists.note_id
            AND notes.author_id = auth.uid()
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_notes_updated_at_trigger
    BEFORE UPDATE ON public.notes
    FOR EACH ROW
    EXECUTE FUNCTION update_notes_updated_at();

CREATE TRIGGER update_note_checklists_updated_at_trigger
    BEFORE UPDATE ON public.note_checklists
    FOR EACH ROW
    EXECUTE FUNCTION update_notes_updated_at();
