// src/types/relationship.ts

export interface RelationshipFormData {
    shortName: string;
    name: string;
    telephone: string;
    email: string;
    website: string;
    kvkNumber: string;
    vatNumber: string;
    street: string;
    houseNumber: string;
    postcode: string;
    place: string;
    land: string;
    isCustomer: boolean;
    isSupplier: boolean;
    customerActivity: string;
    languageCorrespondence?: string;
    industry?: string;
    companySize?: string;
    status?: string;
}

export interface CreateRelationshipFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: RelationshipFormData) => void;
    error: string | null;
    isSubmitting: boolean;  // Added this property
}

export interface NewRelationshipData extends RelationshipFormData {
    id: string;
    relationshipNumber: string;
    createdAt: Date;
    updatedAt: Date;
    status: string;
}