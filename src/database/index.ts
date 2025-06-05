import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import schema from './schemas/schema';
import migrations from './schemas/migrations';
import { models } from './model';
import { runInitialSeeders } from './seeders/initialSeeder';

const adapter = new SQLiteAdapter({
  schema,
  migrations,
  jsi: true, // Habilita o modo JSI para melhor performance
});

export const database = new Database({
  adapter,
  modelClasses: models,
});

export async function initializeDatabase() {
  console.log("WatermelonDB inicializado com schema versão:", schema.version);
  await runInitialSeeders(database);
}