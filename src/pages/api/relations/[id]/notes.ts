// src/pages/api/relations/[id]/notes.ts
import type { APIRoute } from 'astro';
import { noteService } from '../../../../services/noteService';

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

        const notes = await noteService.getAllNotes(id);

        return new Response(
            JSON.stringify({
                success: true,
                data: notes
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    } catch (error) {
        console.error('Error fetching notes:', error);
        return new Response(
            JSON.stringify({
                success: false,
                error: 'Failed to fetch notes',
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