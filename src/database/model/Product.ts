import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, text } from '@nozbe/watermelondb/decorators';

export default class Product extends Model {
  static table = 'products';

  @text('product_code') productCode!: string;
  @text('product_name') productName!: string;
  @field('regular_price') regularPrice!: number;
  @field('club_price') clubPrice!: number;
  @text('unit_type') unitType!: 'KG' | 'UN';

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
  @date('deleted_at') deletedAt?: Date | null;
  @date('restored_at') restoredAt?: Date | null;
}