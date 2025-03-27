// src/pages/api/relationships/[id].ts
import type { APIRoute } from 'astro';
import { relationService } from '../../../services/relationService';
import { insertRelationSchema } from '../../../db/schema';
import {
    handleAPIError,
    validateRequest,
    successResponse,
    notFoundResponse,
    createAPIResponse
} from '../../../utils/api';

export const GET: APIRoute = async ({ params }) => {
    try {
        const { id } = params;
        if (!id) {
            return createAPIResponse({
                success: false,
                error: 'Relationship ID is required'
            }, 400);
        }

        const relation = await relationService.getRelationById(id);
        if (!relation) {
            return notFoundResponse('Relationship not found');
        }

        return successResponse(relation);
    } catch (error) {
        return handleAPIError(error);
    }
};

export const PUT: APIRoute = async ({ params, request }) => {
    try {
        const { id } = params;
        if (!id) {
            return createAPIResponse({
                success: false,
                error: 'Relationship ID is required'
            }, 400);
        }

        // Validate request body using utility function
        const validatedData = await validateRequest(request, insertRelationSchema.partial());

        // Update the relation
        const updated = await relationService.updateRelation(id, validatedData);
        return successResponse(updated);
    } catch (error) {
        return handleAPIError(error);
    }
};

export const DELETE: APIRoute = async ({ params }) => {
    try {
        const { id } = params;
        if (!id) {
            return createAPIResponse({
                success: false,
                error: 'Relationship ID is required'
            }, 400);
        }

        // Check if relationship exists
        const existing = await relationService.getRelationById(id);
        if (!existing) {
            return notFoundResponse('Relationship not found');
        }

        // Delete the relationship and all related records
        await relationService.deleteRelation(id);

        return successResponse({
            message: 'Relationship deleted successfully'
        });
    } catch (error) {
        return handleAPIError(error);
    }
};