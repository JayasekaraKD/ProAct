// src/utils/api.ts
import { ZodError } from 'zod';

interface APIResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    details?: any;
}

export function createAPIResponse<T>(
    data: APIResponse<T>,
    status = 200
): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

export function handleAPIError(error: unknown): Response {
    console.error('API Error:', error);

    if (error instanceof ZodError) {
        return createAPIResponse({
            success: false,
            error: 'Validation failed',
            details: error.errors
        }, 400);
    }

    if (error instanceof Error) {
        const status = error.message.includes('not found') ? 404 : 500;
        return createAPIResponse({
            success: false,
            error: error.message
        }, status);
    }

    return createAPIResponse({
        success: false,
        error: 'An unexpected error occurred'
    }, 500);
}

// Request validation helper
export async function validateRequest<T>(
    request: Request,
    schema: { parse: (data: any) => T }
): Promise<T> {
    const body = await request.json();
    return schema.parse(body);
}

// Success response helper
export function successResponse<T>(data: T, status = 200): Response {
    return createAPIResponse({
        success: true,
        data
    }, status);
}

// Not found helper
export function notFoundResponse(message = 'Resource not found'): Response {
    return createAPIResponse({
        success: false,
        error: message
    }, 404);
}