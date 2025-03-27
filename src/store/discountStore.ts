// src/store/discountStore.ts
import { atom, map } from 'nanostores';
import type { DiscountWithArticle } from '@/db/schema/discounts';

// Store states
export const discounts = atom<DiscountWithArticle[]>([]);
export const selectedDiscount = atom<DiscountWithArticle | null>(null);
export const isEditMode = atom(false);

// Modal state
export const modalState = map({
    isOpen: false,
    isUpdating: false,
    isDeleting: false,
    isSubmitting: false,
    error: null as string | null,
    activeTab: 'basic'
});

// Delete dialog state
export const deleteDialogState = map({
    isOpen: false,
    isDeleting: false,
    error: null as string | null,
    discountToDelete: null as DiscountWithArticle | null
});

// Actions
export function handleView(discount: DiscountWithArticle) {
    selectedDiscount.set(discount);
    isEditMode.set(false);
    modalState.setKey('isOpen', true);
}

export function handleEdit(discount: DiscountWithArticle) {
    selectedDiscount.set(discount);
    isEditMode.set(true);
    modalState.setKey('isOpen', true);
}

export function handleDelete(discount: DiscountWithArticle) {
    deleteDialogState.set({
        isOpen: true,
        isDeleting: false,
        error: null,
        discountToDelete: discount
    });
}

export async function confirmDelete() {
    const discountToDelete = deleteDialogState.get().discountToDelete;
    if (!discountToDelete) return;

    deleteDialogState.setKey('isDeleting', true);
    deleteDialogState.setKey('error', null);

    try {
        const response = await fetch(`/api/discounts/${discountToDelete.id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to delete discount');
        }

        // Update local store
        const currentDiscounts = discounts.get();
        discounts.set(currentDiscounts.filter(d => d.id !== discountToDelete.id));

        // Reset states
        deleteDialogState.set({
            isOpen: false,
            isDeleting: false,
            error: null,
            discountToDelete: null
        });

        modalState.set({
            isOpen: false,
            isUpdating: false,
            error: null,
            activeTab: 'basic',
            isDeleting: false,
            isSubmitting: false
        });
    } catch (error) {
        console.error('Error deleting discount:', error);
        deleteDialogState.setKey('error',
            error instanceof Error ? error.message : 'Failed to delete discount'
        );
    } finally {
        deleteDialogState.setKey('isDeleting', false);
    }
}

export async function createDiscount(data: Partial<DiscountWithArticle>) {
    modalState.setKey('isSubmitting', true);
    modalState.setKey('error', null);

    try {
        const response = await fetch('/api/discounts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create discount');
        }

        const responseData = await response.json();

        // Update store
        const currentDiscounts = discounts.get();
        discounts.set([responseData.data, ...currentDiscounts]);

        return responseData.data;
    } catch (error) {
        modalState.setKey('error', error instanceof Error ? error.message : 'Failed to create discount');
        throw error;
    } finally {
        modalState.setKey('isSubmitting', false);
    }
}