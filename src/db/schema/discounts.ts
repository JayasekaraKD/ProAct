// src/db/schema/discounts.ts
import { pgTable, text, timestamp, uuid, decimal, date, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { articleTable, type ArticleWithRelation } from './articles';

export const discountTable = pgTable('discounts', {
    id: uuid('id').defaultRandom().primaryKey(),
    articleId: uuid('article_id').references(() => articleTable.id, { onDelete: 'cascade' }).notNull(),
    articleGroupId: text('article_group_id'),
    category: text('category').notNull(),
    operationType: text('operation_type').notNull(),
    discountType: text('discount_type').notNull(),
    value: decimal('value', { precision: 10, scale: 2 }).notNull(),
    startDate: date('start_date').notNull(),
    endDate: date('end_date'),
    minimumQuantity: integer('minimum_quantity').default(1),
    maximumQuantity: integer('maximum_quantity'),
    status: text('status').notNull().default('active'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const discountRelations = relations(discountTable, ({ one }) => ({
    article: one(articleTable, {
        fields: [discountTable.articleId],
        references: [articleTable.id],
    }),
}));

export type Discount = typeof discountTable.$inferSelect;
export type NewDiscount = typeof discountTable.$inferInsert;

export type DiscountWithArticle = Discount & {
    article?: ArticleWithRelation | null;
};