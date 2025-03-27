// src/pages/api/articles/[id].ts
import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { articleTable } from '../../../db/schema/articles';
import { relationTable } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { createAPIResponse, handleAPIError } from '../../../utils/api';

export const GET: APIRoute = async ({ params }) => {
    try {
        const { id } = params;
        if (!id) {
            return createAPIResponse({
                success: false,
                error: 'Article ID is required'
            }, 400);
        }

        // Fetch article with relation
        const article = await db.query.articleTable.findFirst({
            where: eq(articleTable.id, id),
            with: {
                relation: {
                    columns: {
                        id: true,
                        shortName: true,
                        name: true
                    }
                }
            },
            columns: {
                id: true,
                articleCode: true,
                description: true,
                relationId: true,
                groupNumber: true,
                groupName: true,
                businessCategory: true,
                unit: true,
                price: true,
                vatRate: true,
                stock: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                eanCode: true,
                oemNumber: true,
                manufacturer: true,
                shortText: true,
                grossPrice: true,
                priceInclBtw: true,
                latestPurchasePrice: true
            }
        });

        if (!article) {
            return createAPIResponse({
                success: false,
                error: 'Article not found'
            }, 404);
        }

        return createAPIResponse({
            success: true,
            data: article
        });

    } catch (error) {
        console.error('Error fetching article:', error);
        return handleAPIError(error);
    }
};

// PUT endpoint for updating article
export const PUT: APIRoute = async ({ request, params }) => {
    try {
        const { id } = params;
        if (!id) {
            return createAPIResponse({
                success: false,
                error: 'Article ID is required'
            }, 400);
        }

        const body = await request.json();

        // Remove undefined values
        const updateData = Object.fromEntries(
            Object.entries(body).filter(([_, v]) => v !== undefined)
        );

        // Update article
        const [updated] = await db
            .update(articleTable)
            .set({
                ...updateData,
                updatedAt: new Date()
            })
            .where(eq(articleTable.id, id))
            .returning();

        if (!updated) {
            return createAPIResponse({
                success: false,
                error: 'Article not found'
            }, 404);
        }

        return createAPIResponse({
            success: true,
            data: updated
        });

    } catch (error) {
        console.error('Error updating article:', error);
        return handleAPIError(error);
    }
};

// DELETE endpoint for deleting article
export const DELETE: APIRoute = async ({ params }) => {
    try {
        const { id } = params;
        if (!id) {
            return createAPIResponse({
                success: false,
                error: 'Article ID is required'
            }, 400);
        }

        // Delete article
        const [deleted] = await db
            .delete(articleTable)
            .where(eq(articleTable.id, id))
            .returning();

        if (!deleted) {
            return createAPIResponse({
                success: false,
                error: 'Article not found'
            }, 404);
        }

        return createAPIResponse({
            success: true,
            data: { message: 'Article deleted successfully' }
        });

    } catch (error) {
        console.error('Error deleting article:', error);
        return handleAPIError(error);
    }
};