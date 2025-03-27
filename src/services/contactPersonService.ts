// src/services/contactPersonService.ts
import { db } from '../db';
import { contactPersons } from '../db/schema';
import type { ContactPerson, NewContactPerson } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

export const contactPersonService = {
    async getAllContactPersons(relationId: string): Promise<ContactPerson[]> {
        try {
            return await db
                .select()
                .from(contactPersons)
                .where(eq(contactPersons.relationId, relationId))
                .orderBy(desc(contactPersons.createdAt));
        } catch (error) {
            console.error('Error fetching contact persons:', error);
            throw error;
        }
    },

    async getContactPersonById(id: string): Promise<ContactPerson | null> {
        try {
            const result = await db
                .select()
                .from(contactPersons)
                .where(eq(contactPersons.id, id))
                .limit(1);

            return result[0] || null;
        } catch (error) {
            console.error('Error fetching contact person:', error);
            throw error;
        }
    },

    async createContactPerson(contactPerson: NewContactPerson): Promise<ContactPerson> {
        try {
            const [result] = await db
                .insert(contactPersons)
                .values(contactPerson)
                .returning();

            if (!result) {
                throw new Error('No contact person was created');
            }

            return result;
        } catch (error) {
            console.error('Error creating contact person:', error);
            throw error;
        }
    },

    async updateContactPerson(
        id: string,
        updates: Partial<ContactPerson>
    ): Promise<ContactPerson> {
        try {
            const [updated] = await db
                .update(contactPersons)
                .set({
                    ...updates,
                    updatedAt: new Date()
                })
                .where(eq(contactPersons.id, id))
                .returning();

            if (!updated) {
                throw new Error('Contact person not found');
            }

            return updated;
        } catch (error) {
            console.error('Error updating contact person:', error);
            throw error;
        }
    },

    async updateMainContact(
        relationId: string,
        contactPersonId: string
    ): Promise<void> {
        try {
            await db.transaction(async (tx) => {
                // First, unset any existing main contact
                await tx
                    .update(contactPersons)
                    .set({ isMainContact: false })
                    .where(eq(contactPersons.relationId, relationId));

                // Then set the new main contact
                const [updated] = await tx
                    .update(contactPersons)
                    .set({ isMainContact: true })
                    .where(
                        eq(contactPersons.id, contactPersonId)
                    )
                    .returning();

                if (!updated) {
                    throw new Error('Contact person not found');
                }
            });
        } catch (error) {
            console.error('Error updating main contact:', error);
            throw error;
        }
    },

    async deleteContactPerson(id: string): Promise<void> {
        try {
            const result = await db
                .delete(contactPersons)
                .where(eq(contactPersons.id, id))
                .returning();

            if (result.length === 0) {
                throw new Error('Contact person not found');
            }
        } catch (error) {
            console.error('Error deleting contact person:', error);
            throw error;
        }
    },

    // async bulkCreateContactPersons(
    //     contactPersons: NewContactPerson[]
    // ): Promise<ContactPerson[]> {
    //     try {
    //         const result = await db
    //             .insert(contactPersons)
    //             .values(contactPersons)
    //             .returning();

    //         return result;
    //     } catch (error) {
    //         console.error('Error bulk creating contact persons:', error);
    //         throw error;
    //     }
    // },

    async getMainContact(relationId: string): Promise<ContactPerson | null> {
        try {
            const result = await db
                .select()
                .from(contactPersons)
                .where(
                    eq(contactPersons.relationId, relationId) &&
                    eq(contactPersons.isMainContact, true)
                )
                .limit(1);

            return result[0] || null;
        } catch (error) {
            console.error('Error fetching main contact:', error);
            throw error;
        }
    }
};