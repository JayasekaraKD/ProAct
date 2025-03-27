// src/services/relationService.ts
import { db } from '../db';
import { relationTable, contactPersons, documents, notes } from '../db/schema';
import type { Relation, NewRelation } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

export const relationService = {
    async getAllRelations(): Promise<Relation[]> {
        try {
            return await db
                .select()
                .from(relationTable)
                .orderBy(desc(relationTable.createdAt));
        } catch (error) {
            console.error('Error fetching relations:', error);
            throw error;
        }
    },


    async createRelation(relation: NewRelation): Promise<Relation> {
        try {
            // Clean up the input data by removing undefined values
            const cleanedData = Object.fromEntries(
                Object.entries(relation).filter(([_, v]) => v !== undefined)
            ) as NewRelation;

            const [result] = await db
                .insert(relationTable)
                .values(cleanedData)
                .returning();

            if (!result) {
                throw new Error('Failed to create relationship');
            }

            return result;
        } catch (error) {
            console.error('Error creating relation:', error);
            throw error;
        }
    },


    async updateRelation(id: string, updates: Partial<Relation>): Promise<Relation> {
        try {
            const [updated] = await db
                .update(relationTable)
                .set({
                    ...updates,
                    updatedAt: new Date()
                })
                .where(eq(relationTable.id, id))
                .returning();

            if (!updated) {
                throw new Error('Relation not found');
            }

            return updated;
        } catch (error) {
            console.error('Error updating relation:', error);
            throw error;
        }
    },

    async deleteRelation(id: string): Promise<void> {
        try {
            await db.transaction(async (tx) => {
                // First, delete all related records
                // This is a safety measure even though we have CASCADE set up
                await tx.delete(notes).where(eq(notes.relationId, id));
                await tx.delete(documents).where(eq(documents.relationId, id));
                await tx.delete(contactPersons).where(eq(contactPersons.relationId, id));

                // Finally, delete the relationship
                const result = await tx
                    .delete(relationTable)
                    .where(eq(relationTable.id, id))
                    .returning();

                if (result.length === 0) {
                    throw new Error('Relationship not found');
                }
            });
        } catch (error) {
            console.error('Error in deleteRelation:', error);
            throw error instanceof Error
                ? error
                : new Error('Failed to delete relationship');
        }
    },

    async getRelationById(id: string): Promise<Relation | null> {
        try {
            const result = await db
                .select()
                .from(relationTable)
                .where(eq(relationTable.id, id))
                .limit(1);

            return result[0] || null;
        } catch (error) {
            console.error('Error in getRelationById:', error);
            throw error instanceof Error
                ? error
                : new Error('Failed to fetch relationship');
        }
    }
};