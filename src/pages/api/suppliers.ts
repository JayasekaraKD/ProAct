// src/pages/api/suppliers.ts
import type { APIRoute } from 'astro';
import { db } from '../../db';
import { relationTable } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { createAPIResponse, handleAPIError } from '../../utils/api';

export const GET: APIRoute = async () => {
    try {
        // Fetch all suppliers (relations where isSupplier is true)
        const suppliers = await db
            .select({
                id: relationTable.id,
                name: relationTable.name,
                code: relationTable.shortName,
            })
            .from(relationTable)
            .where(eq(relationTable.isSupplier, true));

        return createAPIResponse({
            success: true,
            data: suppliers
        });
    } catch (error) {
        return handleAPIError(error);
    }
};