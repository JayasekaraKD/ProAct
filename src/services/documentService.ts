// src/services/documentService.ts
import { db } from '../db';
import { documents } from '../db/schema';
import type { Document, NewDocument } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

export const documentService = {
    async getAllDocuments(relationId: string): Promise<Document[]> {
        return await db
            .select()
            .from(documents)
            .where(eq(documents.relationId, relationId))
            .orderBy(desc(documents.createdAt));
    },

    async createDocument(document: NewDocument): Promise<Document> {
        const [result] = await db
            .insert(documents)
            .values(document)
            .returning();

        if (!result) {
            throw new Error('Failed to create document record');
        }

        return result;
    },

    async deleteDocument(id: string): Promise<void> {
        await db
            .delete(documents)
            .where(eq(documents.id, id));
    }
};