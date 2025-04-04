// src/pages/api/relations/[id]/documents.ts
import type { APIRoute } from 'astro';
import { documentService } from '../../../../services/documentService';

export const GET: APIRoute = async ({ params }) => {
    try {
        const { id } = params;
        if (!id) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Relation ID is required'
                }),
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
        }

        const documents = await documentService.getAllDocuments(id);

        return new Response(
            JSON.stringify({
                success: true,
                data: documents
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    } catch (error) {
        console.error('Error fetching documents:', error);
        return new Response(
            JSON.stringify({
                success: false,
                error: 'Failed to fetch documents',
                details: error instanceof Error ? error.message : 'Unknown error'
            }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    }
};