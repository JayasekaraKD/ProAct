// src/stores/tabStore.ts
import { map } from 'nanostores';

interface TabState {
    activeTab: string;
    tabHistory: string[];
    isDirty: Record<string, boolean>;
    validationErrors: Record<string, string[]>;
}

export const tabStore = map<TabState>({
    activeTab: 'organization',
    tabHistory: ['organization'],
    isDirty: {},
    validationErrors: {}
});

// src/stores/relationshipStore.ts
import { atom } from 'nanostores';
import type { Relation } from '../db/schema';
import { modalStore } from './modalStore';

export const relationshipStore = atom<Relation | null>(null);

// Helper functions for store management
export const storeHelpers = {
    resetStores: () => {
        modalStore.set({
            isOpen: false,
            isUpdating: false,
            isDeleting: false,
            isSubmitting: false,
            error: null
        });

        tabStore.set({
            activeTab: 'organization',
            tabHistory: ['organization'],
            isDirty: {},
            validationErrors: {}
        });

        relationshipStore.set(null);
    },

    markTabDirty: (tabId: string, isDirty: boolean = true) => {
        tabStore.setKey('isDirty', {
            ...tabStore.get().isDirty,
            [tabId]: isDirty
        });
    },

    setValidationErrors: (tabId: string, errors: string[]) => {
        tabStore.setKey('validationErrors', {
            ...tabStore.get().validationErrors,
            [tabId]: errors
        });
    },

    hasUnsavedChanges: () => {
        return Object.values(tabStore.get().isDirty).some(Boolean);
    }
};

// API interaction helpers
export const apiHelpers = {
    async saveRelationship(data: Partial<Relation>) {
        modalStore.setKey('isSubmitting', true);
        modalStore.setKey('error', null);

        try {
            const response = await fetch('/api/relationships', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Failed to save relationship');
            }

            const result = await response.json();
            relationshipStore.set(result.data);
            storeHelpers.resetStores();

            return result.data;
        } catch (error) {
            modalStore.setKey('error', error instanceof Error ? error.message : 'An unknown error occurred');
            throw error;
        } finally {
            modalStore.setKey('isSubmitting', false);
        }
    },

    async updateRelationship(id: string, data: Partial<Relation>) {
        modalStore.setKey('isUpdating', true);
        modalStore.setKey('error', null);

        try {
            const response = await fetch(`/api/relationships/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Failed to update relationship');
            }

            const result = await response.json();
            relationshipStore.set(result.data);

            return result.data;
        } catch (error) {
            modalStore.setKey('error', error instanceof Error ? error.message : 'An unknown error occurred');
            throw error;
        } finally {
            modalStore.setKey('isUpdating', false);
        }
    }
};