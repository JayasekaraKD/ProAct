// src/pages/api/discounts/index.ts
import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { discountTable } from '../../../db/schema/discounts';
import { createAPIResponse, handleAPIError } from '../../../utils/api';
import { z } from 'zod';

// Create a validation schema
const createDiscountSchema = z.object({
    articleId: z.string().uuid("Article ID must be a valid UUID"),
    category: z.enum(['article', 'article_group']),
    operationType: z.enum(['sell', 'purchase']),
    discountType: z.enum(['percentage', 'fixed']),
    value: z.number().positive("Value must be positive"),
    startDate: z.string().datetime(),
    endDate: z.string().datetime().nullable(),
    minimumQuantity: z.number().int().min(1).default(1),
    maximumQuantity: z.number().int().nullable(),
    status: z.enum(['active', 'scheduled', 'expired']).default('active')
});

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();

        // Validate request body
        const validatedData = createDiscountSchema.parse(body);

        // Create new discount with validated data
        const [discount] = await db.insert(discountTable)
            .values({
                articleId: validatedData.articleId,
                category: validatedData.category,
                operationType: validatedData.operationType,
                discountType: validatedData.discountType,
                value: validatedData.value,
                startDate: new Date(validatedData.startDate),
                endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
                minimumQuantity: validatedData.minimumQuantity,
                maximumQuantity: validatedData.maximumQuantity,
                status: validatedData.status,
            })
            .returning();

        if (!discount) {
            throw new Error('Failed to create discount');
        }

        // Fetch the created discount with related data
        const [createdDiscount] = await db.query.discountTable.findMany({
            where: (discounts, { eq }) => eq(discounts.id, discount.id),
            with: {
                article: {
                    with: {
                        relation: {
                            columns: {
                                id: true,
                                name: true,
                                shortName: true
                            }
                        }
                    }
                }
            },
            limit: 1
        });

        return createAPIResponse({
            success: true,
            data: createdDiscount
        }, 201);

    } catch (error) {
        console.error('API Error:', error);
        return handleAPIError(error);
    }
};