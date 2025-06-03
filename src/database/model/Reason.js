import { Model } from '@nozbe/watermelondb';
import { text, date, readonly } from '@nozbe/watermelondb/decorators';

export default class Reason extends Model {
  static table = 'reasons';

  @text('code') code; // Código textual do motivo (ex: '01', '02')
  @text('description') description;
  
  // Mantém @readonly em createdAt (conforme Passo 1)
  @readonly @date('created_at') createdAt;
  
  // Remove @readonly de updatedAt (conforme Passo 1)
  @date('updated_at') updatedAt;
}
