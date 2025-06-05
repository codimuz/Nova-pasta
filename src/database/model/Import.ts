// src/database/model/Import.ts
import { Model } from '@nozbe/watermelondb';
import { text, field, date } from '@nozbe/watermelondb/decorators';

export default class Import extends Model {
  static table = 'imports';

  @text('file_name')
  fileName: string;

  @date('import_date')
  importDate: Date | null;

  @field('items_updated')
  itemsUpdated: number;

  @field('items_inserted')
  itemsInserted: number;

  @text('source')
  source: string;
}