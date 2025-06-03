# Implementação do WatermelonDB

## Estrutura de Diretórios
```
src/
└── database/
    ├── model/
    │   ├── Product.ts
    │   ├── Reason.ts
    │   ├── Entry.ts
    │   ├── EntryChange.ts
    │   ├── Import.ts
    │   └── index.ts
    ├── schemas/
    │   ├── schema.ts
    │   ├── migrations.ts
    │   └── index.ts
    ├── seeders/
    │   ├── initialSeeder.ts
    │   └── index.ts
    └── index.ts
```

## Instalação de Dependências

```bash
npm install @nozbe/watermelondb @nozbe/with-observables
npm install @babel/plugin-proposal-decorators
```

## Implementação dos Modelos

### Product Model (model/Product.ts)
```typescript
import { Model } from '@nozbe/watermelondb'
import { field, date, readonly } from '@nozbe/watermelondb/decorators'

export default class Product extends Model {
  static table = 'products'
  
  @field('product_code') productCode!: string
  @field('product_name') productName!: string
  @field('regular_price') regularPrice!: number
  @field('club_price') clubPrice!: number
  @field('unit_type') unitType!: 'KG' | 'UN'
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date
  @date('deleted_at') deletedAt?: Date
  @date('restored_at') restoredAt?: Date
}
```

### Reason Model (model/Reason.ts)
```typescript
import { Model } from '@nozbe/watermelondb'
import { field, date, readonly } from '@nozbe/watermelondb/decorators'

export default class Reason extends Model {
  static table = 'reasons'
  
  @field('code') code!: string
  @field('description') description!: string
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date
}
```

### Entry Model (model/Entry.ts)
```typescript
import { Model } from '@nozbe/watermelondb'
import { field, relation, date } from '@nozbe/watermelondb/decorators'

export default class Entry extends Model {
  static table = 'entries'
  
  @field('product_code') productCode!: string
  @field('product_name') productName!: string
  @field('quantity') quantity!: number
  @field('reason_id') reasonId!: string
  @field('entry_date') entryDate!: Date
  @field('is_synchronized') isSynchronized!: boolean

  @relation('reasons', 'reason_id') reason!: Relation<Reason>
  @relation('products', 'product_code') product!: Relation<Product>
}
```

### EntryChange Model (model/EntryChange.ts)
```typescript
import { Model } from '@nozbe/watermelondb'
import { field, relation, date } from '@nozbe/watermelondb/decorators'

export default class EntryChange extends Model {
  static table = 'entry_changes'
  
  @field('product_code') productCode!: string
  @field('product_name') productName!: string
  @field('old_quantity') oldQuantity?: number
  @field('new_quantity') newQuantity!: number
  @field('old_reason_id') oldReasonId?: string
  @field('new_reason_id') newReasonId!: string
  @field('change_date') changeDate!: Date
  @field('action_type') actionType!: 'insertion' | 'edition' | 'removal' | 'movement'

  @relation('reasons', 'old_reason_id') oldReason?: Relation<Reason>
  @relation('reasons', 'new_reason_id') newReason!: Relation<Reason>
}
```

### Import Model (model/Import.ts)
```typescript
import { Model } from '@nozbe/watermelondb'
import { field, date } from '@nozbe/watermelondb/decorators'

export default class Import extends Model {
  static table = 'imports'
  
  @field('file_name') fileName!: string
  @field('import_date') importDate!: Date
  @field('items_updated') itemsUpdated?: number
  @field('items_inserted') itemsInserted?: number
  @field('source') source?: string
}
```

## Configuração do Schema (schemas/schema.ts)
```typescript
import { appSchema, tableSchema } from '@nozbe/watermelondb'

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'products',
      columns: [
        { name: 'product_code', type: 'string', isIndexed: true },
        { name: 'product_name', type: 'string' },
        { name: 'regular_price', type: 'number' },
        { name: 'club_price', type: 'number' },
        { name: 'unit_type', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'deleted_at', type: 'number', isOptional: true },
        { name: 'restored_at', type: 'number', isOptional: true }
      ]
    }),
    // ... outras definições de tabelas
  ]
})
```

## Configuração do Banco de Dados (index.ts)
```typescript
import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import schema from './schemas/schema'
import migrations from './schemas/migrations'

// Models
import Product from './model/Product'
import Reason from './model/Reason'
import Entry from './model/Entry'
import EntryChange from './model/EntryChange'
import Import from './model/Import'

const adapter = new SQLiteAdapter({
  schema,
  migrations,
  dbName: 'InventoryDB',
  // Opções adicionais de configuração do SQLite
})

export const database = new Database({
  adapter,
  modelClasses: [
    Product,
    Reason,
    Entry,
    EntryChange,
    Import
  ],
})
```

## Seeders (seeders/initialSeeder.ts)
```typescript
import { database } from '../index'

export async function seedInitialData() {
  await database.write(async () => {
    // Implementar lógica de seed inicial se necessário
  })
}
```

## Próximos Passos

1. Criar os diretórios e arquivos conforme a estrutura definida
2. Implementar as migrations para versionamento do banco
3. Configurar o sistema de backup
4. Implementar os seeders para dados iniciais
5. Criar hooks personalizados para acesso aos dados
6. Integrar com os componentes React Native existentes

## Considerações de Segurança

- Implementar validação de dados antes da persistência
- Configurar backup automático
- Gerenciar transações adequadamente
- Implementar mecanismos de recuperação de dados