// src/utils/validation.ts
import { z } from 'zod';

// Common validation patterns
const patterns = {
    // More lenient phone pattern that allows various formats
    phone: /^[0-9+\-() ]{6,20}$/,
    kvk: /^\d{8}$/, // 8 digits
    vat: /^[A-Z]{2}[0-9A-Z]+$/, // Country code + numbers
    postcode: /^[1-9][0-9]{3} ?(?!sa|sd|ss)[a-z]{2}$/i, // Dutch postcode format
};

// Form validation utilities
export function validateField(value: string, type: 'email' | 'phone' | 'kvk' | 'vat' | 'postcode'): boolean {
    if (!value) return true; // Allow empty values for optional fields

    switch (type) {
        case 'email':
            return z.string().email().safeParse(value).success;
        case 'phone':
            return patterns.phone.test(value);
        case 'kvk':
            return patterns.kvk.test(value);
        case 'vat':
            return patterns.vat.test(value);
        case 'postcode':
            return patterns.postcode.test(value);
        default:
            return true;
    }
}

// Relationship form specific validation
export const relationshipValidation = {
    isValidShortName: (value: string) => value.length >= 2 && value.length <= 50,
    isValidName: (value: string) => value.length >= 2 && value.length <= 100,
    isValidEmail: (value: string) => !value || validateField(value, 'email'),
    isValidPhone: (value: string) => !value || validateField(value, 'phone'),
    isValidKvk: (value: string) => !value || validateField(value, 'kvk'),
    isValidVat: (value: string) => !value || validateField(value, 'vat'),
    isValidPostcode: (value: string) => !value || validateField(value, 'postcode'),

    validateForm: (data: any) => {
        const errors: Record<string, string> = {};

        if (!data.shortName || !relationshipValidation.isValidShortName(data.shortName)) {
            errors.shortName = 'Short name must be between 2 and 50 characters';
        }

        if (!data.name || !relationshipValidation.isValidName(data.name)) {
            errors.name = 'Name must be between 2 and 100 characters';
        }

        if (data.email && !relationshipValidation.isValidEmail(data.email)) {
            errors.email = 'Invalid email format';
        }

        if (data.telephone && !relationshipValidation.isValidPhone(data.telephone)) {
            errors.telephone = 'Phone number should be between 6 and 20 digits';
        }

        if (data.kvkNumber && !relationshipValidation.isValidKvk(data.kvkNumber)) {
            errors.kvkNumber = 'KVK number must be 8 digits';
        }

        if (data.vatNumber && !relationshipValidation.isValidVat(data.vatNumber)) {
            errors.vatNumber = 'Invalid VAT number format';
        }

        if (data.postcode && !relationshipValidation.isValidPostcode(data.postcode)) {
            errors.postcode = 'Invalid postcode format';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
};