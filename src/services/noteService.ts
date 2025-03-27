// src/services/noteService.ts
import { db } from '../db';
import { notes } from '../db/schema';
import type { Note, NewNote } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

export const noteService = {
    async getAllNotes(relationId: string): Promise<Note[]> {
        try {
            return await db
                .select()
                .from(notes)
                .where(eq(notes.relationId, relationId))
                .orderBy(desc(notes.createdAt));
        } catch (error) {
            console.error('Error fetching notes:', error);
            throw error;
        }
    },

    async createNote(note: NewNote): Promise<Note> {
        try {
            const [result] = await db
                .insert(notes)
                .values(note)
                .returning();

            if (!result) {
                throw new Error('No note was created');
            }

            return result;
        } catch (error) {
            console.error('Error creating note:', error);
            throw error;
        }
    },

    async updateNote(id: string, updates: Partial<Note>): Promise<Note> {
        try {
            const [updated] = await db
                .update(notes)
                .set({
                    ...updates,
                    updatedAt: new Date()
                })
                .where(eq(notes.id, id))
                .returning();

            if (!updated) {
                throw new Error('Note not found');
            }

            return updated;
        } catch (error) {
            console.error('Error updating note:', error);
            throw error;
        }
    },

    async deleteNote(id: string): Promise<void> {
        try {
            const result = await db
                .delete(notes)
                .where(eq(notes.id, id))
                .returning();

            if (result.length === 0) {
                throw new Error('Note not found');
            }
        } catch (error) {
            console.error('Error deleting note:', error);
            throw error;
        }
    }
};