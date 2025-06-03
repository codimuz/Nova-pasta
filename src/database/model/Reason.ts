import { Model } from '@nozbe/watermelondb';
import { readonly, date, text } from '@nozbe/watermelondb/decorators';

export default class Reason extends Model {
  static table = 'reasons';

  @text('code') code!: string; // Código textual do motivo (ex: '01', '02')
  @text('description') description!: string;

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}