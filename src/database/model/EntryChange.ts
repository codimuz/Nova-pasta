// src/database/model/EntryChange.ts
import { Model } from '@nozbe/watermelondb';
import { text, field, date } from '@nozbe/watermelondb/decorators';

export default class EntryChange extends Model {
  static table = 'entry_changes';

  @text('product_code')
  productCode: string;

  @text('product_name')
  productName: string;

  @field('old_quantity')
  oldQuantity: number | null;

  @field('new_quantity')
  newQuantity: number;

  @text('old_reason_id')
  oldReasonId: string | null;

  @text('new_reason_id')
  newReasonId: string;

  @date('change_date')
  changeDate: Date | null;

  @text('action_type')
  actionType: string;
}