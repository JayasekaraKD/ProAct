// src/pages/api/relations/[id]/contact-persons.ts
import type { APIRoute } from 'astro';
import { contactPersonService } from '../../../../services/contactPersonService';
import { insertContactPersonSchema } from '../../../../db/schema';
import {
    handleAPIError,
    validateRequest,
    successResponse,
    notFoundResponse
} from '../../../../utils/api';

export const GET: APIRoute = async ({ params }) => {
    try {
        const { id } = params;
        if (!id) {
            return new Response(
                JSON.stringify({
                    error: 'Relation ID is required'
                }),
                { status: 400 }
            );
        }

        const contactPersons = await contactPersonService.getAllContactPersons(id);

        return new Response(
            JSON.stringify({ data: contactPersons }),
            { status: 200 }
        );
    } catch (error) {
        console.error('API Error:', error);
        return new Response(
            JSON.stringify({
                error: error instanceof Error ? error.message : 'An error occurred'
            }),
            { status: 500 }
        );
    }
};

export const POST: APIRoute = async ({ request, params }) => {
    try {
        const { id: relationId } = params;
        if (!relationId) {
            return new Response(
                JSON.stringify({
                    error: 'Relation ID is required'
                }),
                { status: 400 }
            );
        }

        const body = await request.json();
        const validatedData = insertContactPersonSchema.parse({
            ...body,
            relationId
        });

        const created = await contactPersonService.createContactPerson(validatedData);

        // If this is set as main contact, update the main contact status
        if (body.isMainContact) {
            await contactPersonService.updateMainContact(relationId, created.id);
        }

        return successResponse(created, 201);
    } catch (error) {
        return handleAPIError(error);
    }
};