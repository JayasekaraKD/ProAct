// src/store/articleStore.ts
import { atom, map } from 'nanostores';
import type { Article, ArticleWithRelation } from '../db/schema/articles';

// Atoms
export const articles = atom<ArticleWithRelation[]>([]);
export const selectedArticle = atom<ArticleWithRelation | null>(null);
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
    articleToDelete: null as ArticleWithRelation | null
});

// Actions
export function handleView(article: ArticleWithRelation) {
    selectedArticle.set(article);
    isEditMode.set(false);
    modalState.setKey('isOpen', true);
}

export function handleEdit(article: ArticleWithRelation) {
    selectedArticle.set(article);
    isEditMode.set(true);
    modalState.setKey('isOpen', true);
}

export function handleDelete(article: ArticleWithRelation) {
    deleteDialogState.set({
        isOpen: true,
        isDeleting: false,
        error: null,
        articleToDelete: article
    });
}

export async function handleCreate(data: Partial<Article>) {
    modalState.setKey('isSubmitting', true);
    modalState.setKey('error', null);

    try {
        const response = await fetch('/api/articles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(
                responseData.error ||
                (responseData.details && JSON.stringify(responseData.details)) ||
                'Failed to create article'
            );
        }

        // Update the local store with the new article
        const currentArticles = articles.get();
        articles.set([responseData.data, ...currentArticles]);

        // Close the modal
        modalState.setKey('isOpen', false);
        return responseData.data;
    } catch (error) {
        console.error('Error creating article:', error);
        modalState.setKey('error', error instanceof Error ? error.message : 'An unknown error occurred');
        throw error;
    } finally {
        modalState.setKey('isSubmitting', false);
    }
}

export async function handleUpdate(id: string, data: Partial<Article>) {
    modalState.setKey('isUpdating', true);
    modalState.setKey('error', null);

    try {
        // Clean empty strings to null
        const cleanedData = Object.entries(data).reduce((acc, [key, value]) => {
            acc[key] = value === '' ? null : value;
            return acc;
        }, {} as Record<string, any>);

        const response = await fetch(`/api/articles/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cleanedData)
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.error || 'Failed to update article');
        }

        // Update successful
        modalState.setKey('isOpen', false);
        selectedArticle.set(null);
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

export async function confirmDelete() {
    const articleToDelete = deleteDialogState.get().articleToDelete;

    if (!articleToDelete) return;

    deleteDialogState.setKey('isDeleting', true);
    deleteDialogState.setKey('error', null);

    try {
        const response = await fetch(`/api/articles/${articleToDelete.id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to delete article');
        }

        // Update the local store
        const currentArticles = articles.get();
        articles.set(currentArticles.filter(a => a.id !== articleToDelete.id));

        // Reset states
        deleteDialogState.set({
            isOpen: false,
            isDeleting: false,
            error: null,
            articleToDelete: null
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
        console.error('Error deleting article:', error);
        deleteDialogState.setKey('error', error instanceof Error ? error.message : 'Failed to delete article');
    } finally {
        deleteDialogState.setKey('isDeleting', false);
    }
}