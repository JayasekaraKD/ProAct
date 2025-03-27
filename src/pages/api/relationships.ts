// src/pages/api/relationships.ts
import type { APIRoute } from 'astro';
import { relationService } from '../../services/relationService';
import { handleAPIError, validateRequest, successResponse } from '../../utils/api';
import { insertRelationSchema } from '../../db/schema';

export const POST: APIRoute = async ({ request }) => {
    try {
        const validatedData = await validateRequest(request, insertRelationSchema);
        const created = await relationService.createRelation(validatedData);
        return successResponse(created, 201);
    } catch (error) {
        return handleAPIError(error);
    }
};