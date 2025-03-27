// src/store/formStore.ts
import { map } from 'nanostores';
import type { RelationshipFormData } from '../types/relationship';
import { relationshipValidation } from '../utils/validation';

export const formState = map<RelationshipFormData>({
    shortName: '',
    name: '',
    telephone: '',
    email: '',
    website: '',
    kvkNumber: '',
    vatNumber: '',
    street: '',
    houseNumber: '',
    postcode: '',
    place: '',
    land: '',
    isCustomer: false,
    isSupplier: false,
    customerActivity: ''
});

export const formErrors = map<Record<string, string>>({});

export const resetForm = () => {
    formState.set({
        shortName: '',
        name: '',
        telephone: '',
        email: '',
        website: '',
        kvkNumber: '',
        vatNumber: '',
        street: '',
        houseNumber: '',
        postcode: '',
        place: '',
        land: '',
        isCustomer: false,
        isSupplier: false,
        customerActivity: ''
    });
    formErrors.set({});
};

export const validateForm = () => {
    const data = formState.get();
    const { isValid, errors } = relationshipValidation.validateForm(data);
    formErrors.set(errors);
    return isValid;
};