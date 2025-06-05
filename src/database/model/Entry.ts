// src/database/model/Entry.ts
import { Model } from '@nozbe/watermelondb';
import { text, field, date, relation, readonly } from '@nozbe/watermelondb/decorators';
import Product from './Product';
import Reason from './Reason';

export default class Entry extends Model {
  static table = 'entries';

  @text('product_code_value')
  productCodeValue: string;

  @text('product_name')
  productName: string;

  @field('quantity')
  quantity: number;

  @text('reason_code_value')
  reasonCodeValue: string;

  @date('entry_date')
  entryDate: Date | null;

  @field('is_synchronized')
  isSynchronized: boolean;

  @readonly
  @text('linked_product_id')
  linkedProductId: string;

  @relation('products', 'linked_product_id')
  product: Product;

  @readonly
  @text('linked_reason_id')
  linkedReasonId: string;

  @relation('reasons', 'linked_reason_id')
  reason: Reason;

  @text('chosen_unit_type')
  chosen_unit_type: string;
}