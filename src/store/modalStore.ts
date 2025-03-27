// src/stores/modalStore.ts
import { map } from 'nanostores';

interface ModalState {
    isOpen: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
    isSubmitting: boolean;
    error: string | null;
}

export const modalStore = map<ModalState>({
    isOpen: false,
    isUpdating: false,
    isDeleting: false,
    isSubmitting: false,
    error: null
});

