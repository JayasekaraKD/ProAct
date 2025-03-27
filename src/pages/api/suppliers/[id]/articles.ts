// src/pages/api/suppliers/[id]/articles.ts
import type { APIRoute } from 'astro';
import { db } from '../../../../db';
import { articleTable } from '../../../../db/schema/articles';
import { eq } from 'drizzle-orm';
import { createAPIResponse, handleAPIError } from '../../../../utils/api';

export const GET: APIRoute = async ({ params }) => {
    try {
        const { id } = params;
        if (!id) {
            return createAPIResponse({
                success: false,
                error: 'Supplier ID is required'
            }, 400);
        }

        // Fetch articles for the supplier
        const articles = await db
            .select({
                id: articleTable.id,
                articleCode: articleTable.articleCode,
                description: articleTable.description,
                price: articleTable.price,
            })
            .from(articleTable)
            .where(eq(articleTable.relationId, id))
            .orderBy(articleTable.articleCode);

        return createAPIResponse({
            success: true,
            data: articles
        });
    } catch (error) {
        return handleAPIError(error);
    }
};