// src/services/discountService.ts
import {
    discountTable,
    type DiscountWithArticle,
    type Discount
} from '@/db/schema/discounts';
import { articleTable, type Article } from '@/db/schema/articles';
import { relationTable, type Relation } from '@/db/schema';
import { db } from '../db';
import { eq, desc } from 'drizzle-orm';

type DiscountResult = {
    id: string;
    articleId: string;
    articleGroupId: string | null;
    category: string;
    operationType: string;
    discountType: string;
    value: string;
    startDate: Date;
    endDate: Date | null;
    minimumQuantity: number;
    maximumQuantity: number | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    article: {
        id: string;
        articleCode: string;
        description: string;
        relation: {
            id: string;
            name: string;
            shortName: string;
        } | null;
    } | null;
};

export const discountService = {
    async getAllDiscounts(): Promise<DiscountWithArticle[]> {
        try {
            const discounts = await db
                .select({
                    // Discount fields
                    id: discountTable.id,
                    articleId: discountTable.articleId,
                    articleGroupId: discountTable.articleGroupId,
                    category: discountTable.category,
                    operationType: discountTable.operationType,
                    discountType: discountTable.discountType,
                    value: discountTable.value,
                    startDate: discountTable.startDate,
                    endDate: discountTable.endDate,
                    minimumQuantity: discountTable.minimumQuantity,
                    maximumQuantity: discountTable.maximumQuantity,
                    status: discountTable.status,
                    createdAt: discountTable.createdAt,
                    updatedAt: discountTable.updatedAt,
                    // Nest article and relation
                    article: {
                        id: articleTable.id,
                        articleCode: articleTable.articleCode,
                        description: articleTable.description,
                        relation: {
                            id: relationTable.id,
                            name: relationTable.name,
                            shortName: relationTable.shortName
                        }
                    }
                })
                .from(discountTable)
                .leftJoin(
                    articleTable,
                    eq(discountTable.articleId, articleTable.id)
                )
                .leftJoin(
                    relationTable,
                    eq(articleTable.relationId, relationTable.id)
                ) as unknown as DiscountResult[];

            return discounts.map(discount => ({
                ...discount,
                article: discount.article ? {
                    ...discount.article,
                    relation: discount.article.relation ? {
                        ...discount.article.relation,
                        id: String(discount.article.relation.id),
                        name: String(discount.article.relation.name),
                        shortName: String(discount.article.relation.shortName)
                    } : null
                } : undefined
            })) as unknown as DiscountWithArticle[];
        } catch (error) {
            console.error('Error fetching discounts:', error);
            throw error;
        }
    }
};