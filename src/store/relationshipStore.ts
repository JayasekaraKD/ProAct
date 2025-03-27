// src/store/relationshipStore.ts
import { atom, map } from 'nanostores';
import type { Relation } from '../db/schema';
import type { RelationshipFormData } from '../types/relationship';

// Atoms
export const relationships = atom<Relation[]>([]);
export const selectedRelation = atom<Relation | null>(null);
export const isEditMode = atom(false);

// Modal state with isSubmitting property added
export const modalState = map({
    isOpen: false,
    isUpdating: false,
    isDeleting: false,
    isSubmitting: false, // Added this property
    error: null as string | null,
    activeTab: 'organization'
});

// Actions
export function handleView(relation: Relation) {
    selectedRelation.set(relation);
    isEditMode.set(false);
    modalState.setKey('isOpen', true);
}

export function handleEdit(relation: Relation) {
    selectedRelation.set(relation);
    isEditMode.set(true);
    modalState.setKey('isOpen', true);
}

export async function handleCreate(data: RelationshipFormData) {
    modalState.setKey('isSubmitting', true);
    modalState.setKey('error', null);

    try {
        const response = await fetch('/api/relationships', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                shortName: data.shortName,
                name: data.name,
                telephone: data.telephone || null,
                email: data.email || null,
                website: data.website || null,
                kvkNumber: data.kvkNumber || null,
                vatNumber: data.vatNumber || null,
                street: data.street || null,
                houseNumber: data.houseNumber || null,
                postcode: data.postcode || null,
                place: data.place || null,
                land: data.land || null,
                isCustomer: data.isCustomer,
                isSupplier: data.isSupplier,
            }),
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(
                responseData.error ||
                (responseData.details && JSON.stringify(responseData.details)) ||
                'Failed to create relationship'
            );
        }

        // Update the local store with the new relationship
        const currentRelations = relationships.get();
        relationships.set([responseData.data, ...currentRelations]);

        // Close the modal
        modalState.setKey('isOpen', false);
        return responseData.data;
    } catch (error) {
        console.error('Error creating relationship:', error);
        modalState.setKey('error', error instanceof Error ? error.message : 'An unknown error occurred');
        throw error;
    } finally {
        modalState.setKey('isSubmitting', false);
    }
}


export async function handleUpdate(id: string, data: Partial<Relation>) {
    modalState.setKey('isUpdating', true);
    modalState.setKey('error', null);

    try {
        const cleanedData = Object.entries(data).reduce((acc, [key, value]) => {
            acc[key] = value === '' ? null : value;
            return acc;
        }, {} as Record<string, any>);

        const response = await fetch(`/api/relationships/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cleanedData)
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.error || 'Failed to update relationship');
        }

        // Update successful
        modalState.setKey('isOpen', false);
        selectedRelation.set(null);
        isEditMode.set(false);

        // Reload to get fresh data
        window.location.reload();
    } catch (error) {
        modalState.setKey('error', error instanceof Error ? error.message : 'An error occurred');
        throw error;
    } finally {
        modalState.setKey('isUpdating', false);
    }
}
export const deleteDialogState = map({
    isOpen: false,
    isDeleting: false,
    error: null as string | null,
    relationToDelete: null as Relation | null
});

// Update or add this handleDelete function
export async function handleDelete(relation: Relation) {
    deleteDialogState.set({
        isOpen: true,
        isDeleting: false,
        error: null,
        relationToDelete: relation
    });
}

export async function confirmDelete() {
    const relationToDelete = deleteDialogState.get().relationToDelete;

    if (!relationToDelete) return;

    deleteDialogState.setKey('isDeleting', true);
    deleteDialogState.setKey('error', null);

    try {
        const response = await fetch(`/api/relationships/${relationToDelete.id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to delete relationship');
        }

        if (data.success) {
            // Update the local store
            const currentRelations = relationships.get();
            relationships.set(currentRelations.filter(r => r.id !== relationToDelete.id));

            // Reset states
            deleteDialogState.set({
                isOpen: false,
                isDeleting: false,
                error: null,
                relationToDelete: null
            });

            modalState.set({
                isOpen: false,
                isUpdating: false,
                error: null,
                activeTab: 'organization',
                isDeleting: false,
                isSubmitting: false
            });
        }
    } catch (error) {
        console.error('Error deleting relationship:', error);
        deleteDialogState.setKey('error', error instanceof Error ? error.message : 'Failed to delete relationship');
    } finally {
        deleteDialogState.setKey('isDeleting', false);
    }
}