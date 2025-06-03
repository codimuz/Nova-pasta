import { Model } from '@nozbe/watermelondb';
import { field, date, relation, text, readonly } from '@nozbe/watermelondb/decorators';
import Product from './Product';
import Reason from './Reason';

export default class Entry extends Model {
  static table = 'entries';

  @text('product_code_value') productCodeValue!: string; // Código de barras textual
  @text('product_name') productName!: string; // Nome do produto (denormalizado)
  @field('quantity') quantity!: number;
  @text('reason_code_value') reasonCodeValue!: string; // Código textual do motivo (ex: '01')
  @date('entry_date') entryDate!: Date;
  @field('is_synchronized') isSynchronized!: boolean;

  // Relacionamentos com IDs do WatermelonDB
  @readonly @text('linked_product_id') linkedProductId!: string;
  @relation('products', 'linked_product_id') product!: Product;

  @readonly @text('linked_reason_id') linkedReasonId!: string;
  @relation('reasons', 'linked_reason_id') reason!: Reason;
}