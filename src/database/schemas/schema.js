import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
  version: 1, // Versão do schema
  tables: [
    tableSchema({
      name: 'products',
      columns: [
        { name: 'product_code', type: 'string', isIndexed: true },
        { name: 'product_name', type: 'string', isIndexed: true },
        { name: 'regular_price', type: 'number' },
        { name: 'club_price', type: 'number' },
        { name: 'unit_type', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'deleted_at', type: 'number', isOptional: true },
        { name: 'restored_at', type: 'number', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'reasons',
      columns: [
        { name: 'code', type: 'string', isIndexed: true },
        { name: 'description', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'entries',
      columns: [
        { name: 'product_code_value', type: 'string', isIndexed: true },
        { name: 'product_name', type: 'string' },
        { name: 'quantity', type: 'number' },
        { name: 'reason_code_value', type: 'string', isIndexed: true },
        { name: 'entry_date', type: 'number', isIndexed: true },
        { name: 'is_synchronized', type: 'boolean', isOptional: true },
        { name: 'linked_product_id', type: 'string', isIndexed: true },
        { name: 'linked_reason_id', type: 'string', isIndexed: true },
      ],
    }),
    tableSchema({
      name: 'entry_changes',
      columns: [
        { name: 'product_code', type: 'string', isIndexed: true },
        { name: 'product_name', type: 'string' },
        { name: 'old_quantity', type: 'number', isOptional: true },
        { name: 'new_quantity', type: 'number' },
        { name: 'old_reason_id', type: 'string', isOptional: true, isIndexed: true },
        { name: 'new_reason_id', type: 'string', isIndexed: true },
        { name: 'change_date', type: 'number', isIndexed: true },
        { name: 'action_type', type: 'string' }, // 'insertion', 'edition', 'removal', 'movement'
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
});
