// src/db/schema.ts
import { pgTable, text, timestamp, uuid, boolean, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Base relation table
export const relationTable = pgTable('relations', {
    id: uuid('id').defaultRandom().primaryKey(),
    shortName: text('short_name').notNull(),
    relationshipNumber: text('relationship_number'),
    name: text('name').notNull(),
    telephone: text('telephone'),
    email: text('email'),
    website: text('website'),
    kvkNumber: text('kvk_number'),
    vatNumber: text('vat_number'),

    // Address fields
    street: text('street'),
    houseNumber: text('house_number'),
    postcode: text('postcode'),
    place: text('place'),
    land: text('land'),

    // Visiting address fields
    visitingStreet: text('visiting_street'),
    visitingHouseNumber: text('visiting_house_number'),
    visitingPostcode: text('visiting_postcode'),
    visitingPlace: text('visiting_place'),
    visitingLand: text('visiting_land'),

    // Mailing address fields
    mailingStreet: text('mailing_street'),
    mailingHouseNumber: text('mailing_house_number'),
    mailingPostcode: text('mailing_postcode'),
    mailingPlace: text('mailing_place'),
    mailingLand: text('mailing_land'),

    // Financial fields
    bankAccount: text('bank_account'),
    paymentTerm: integer('payment_term'),
    creditLimit: integer('credit_limit'),
    invoiceMethod: text('invoice_method'),
    currency: text('currency'),

    // Additional fields
    languageCorrespondence: text('language'),
    isCustomer: boolean('is_customer').default(false),
    isSupplier: boolean('is_supplier').default(false),

    // Metadata
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Contact persons table
export const contactPersons = pgTable('contact_persons', {
    id: uuid('id').defaultRandom().primaryKey(),
    relationId: uuid('relation_id').notNull().references(() => relationTable.id, {
        onDelete: 'cascade'
    }),
    name: text('name').notNull(),
    email: text('email'),
    phone: text('phone'),
    position: text('position'),
    department: text('department'),
    isMainContact: boolean('is_main_contact').default(false),
    notes: text('notes'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Documents table
export const documents = pgTable('documents', {
    id: uuid('id').defaultRandom().primaryKey(),
    relationId: uuid('relation_id').notNull().references(() => relationTable.id, {
        onDelete: 'cascade'
    }),
    name: text('name').notNull(),
    type: text('type').notNull(),
    path: text('path').notNull(),
    size: integer('size'),
    mimeType: text('mime_type'),
    description: text('description'),
    uploadedBy: uuid('uploaded_by'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Notes table
export const notes = pgTable('notes', {
    id: uuid('id').defaultRandom().primaryKey(),
    relationId: uuid('relation_id').notNull().references(() => relationTable.id, {
        onDelete: 'cascade'
    }),
    title: text('title').notNull(),
    content: text('content').notNull(),
    category: text('category'),
    isPrivate: boolean('is_private').default(false),
    createdBy: uuid('created_by'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Define table relationships
export const relationRelations = relations(relationTable, ({ many }) => ({
    contactPersons: many(contactPersons),
    documents: many(documents),
    notes: many(notes),
}));

export const contactPersonRelations = relations(contactPersons, ({ one }) => ({
    relation: one(relationTable, {
        fields: [contactPersons.relationId],
        references: [relationTable.id],
    }),
}));

export const documentRelations = relations(documents, ({ one }) => ({
    relation: one(relationTable, {
        fields: [documents.relationId],
        references: [relationTable.id],
    }),
}));

export const noteRelations = relations(notes, ({ one }) => ({
    relation: one(relationTable, {
        fields: [notes.relationId],
        references: [relationTable.id],
    }),
}));

// Zod validation schemas
export const insertRelationSchema = createInsertSchema(relationTable, {
    shortName: z.string().min(1, "Short name is required"),
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format").optional().nullable(),
    // Updated website validation to handle empty strings and optional values
    // website: z.string()
    //     .trim()
    //     .transform(val => val === '' ? null : val)
    //     .pipe(
    //         z.string()
    //             .url("Invalid website URL")
    //             .optional()
    //             .nullable()
    //     )
    //     .optional()
    //     .nullable(),
    // kvkNumber: z.string().min(8, "KVK number must be 8 characters").max(8).optional().nullable(),
    vatNumber: z.string().regex(/^[A-Z]{2}[0-9A-Z]+$/, "Invalid VAT number format").optional().nullable(),
    telephone: z.string().optional().nullable(),
    paymentTerm: z.number().min(0).optional().nullable(),
    creditLimit: z.number().min(0).optional().nullable(),
    isCustomer: z.boolean().optional().default(false),
    isSupplier: z.boolean().optional().default(false),
}).omit({
    id: true,
    createdAt: true,
    updatedAt: true
});

export const insertContactPersonSchema = createInsertSchema(contactPersons, {
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format").optional().nullable(),
    phone: z.string().optional().nullable(),
}).omit({
    id: true,
    createdAt: true,
    updatedAt: true
});

export const insertDocumentSchema = createInsertSchema(documents, {
    name: z.string().min(1, "Name is required"),
    type: z.string().min(1, "Type is required"),
    path: z.string().min(1, "Path is required"),
}).omit({
    id: true,
    createdAt: true,
    updatedAt: true
});

export const insertNoteSchema = createInsertSchema(notes, {
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required"),
}).omit({
    id: true,
    createdAt: true,
    updatedAt: true
});

// Type definitions
export type Relation = typeof relationTable.$inferSelect;
export type NewRelation = typeof relationTable.$inferInsert;

export type ContactPerson = typeof contactPersons.$inferSelect;
export type NewContactPerson = typeof contactPersons.$inferInsert;

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;

export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;

// Validation type helpers
export type InsertRelation = z.infer<typeof insertRelationSchema>;
export type InsertContactPerson = z.infer<typeof insertContactPersonSchema>;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type InsertNote = z.infer<typeof insertNoteSchema>;