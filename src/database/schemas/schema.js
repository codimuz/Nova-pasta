"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const watermelondb_1 = require("@nozbe/watermelondb");
exports.default = (0, watermelondb_1.appSchema)({
    version: 1, // Versão do schema
    tables: [
        (0, watermelondb_1.tableSchema)({
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
        (0, watermelondb_1.tableSchema)({
            name: 'reasons',
            columns: [
                { name: 'code', type: 'string', isIndexed: true },
                { name: 'description', type: 'string' },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ],
        }),
        (0, watermelondb_1.tableSchema)({
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
    ],
});
