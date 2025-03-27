// src/db/schema/articles.ts
import { pgTable, text, timestamp, uuid, boolean, integer, decimal } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { relationTable } from '../schema';
import type { Relation } from '../schema';

export const articleTable = pgTable('articles', {
    id: uuid('id').defaultRandom().primaryKey(),
    articleCode: text('article_code').notNull(),
    description: text('description').notNull(),
    relationId: uuid('relation_id').notNull().references(() => relationTable.id),
    eanCode: text('ean_code'),
    oemNumber: text('oem_number'),
    manufacturer: text('manufacturer'),
    shortText: text('short_text'),
    grossPrice: decimal('gross_price', { precision: 10, scale: 2 }),
    priceInclBtw: decimal('price_incl_btw', { precision: 10, scale: 2 }),
    latestPurchasePrice: decimal('latest_purchase_price', { precision: 10, scale: 2 }),
    groupNumber: integer('group_number'),
    groupName: text('group_name'),
    businessCategory: text('business_category'),
    unit: text('unit').notNull(),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    vatRate: decimal('vat_rate', { precision: 5, scale: 2 }).notNull(),
    stock: integer('stock').default(0),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const articleRelations = relations(articleTable, ({ one }) => ({
    relation: one(relationTable, {
        fields: [articleTable.relationId],
        references: [relationTable.id],
    }),
}));

export type Article = typeof articleTable.$inferSelect;
export type NewArticle = typeof articleTable.$inferInsert;

export type ArticleWithRelation = Article & {
    relation: Pick<Relation, "id" | "shortName" | "name"> | null;
};