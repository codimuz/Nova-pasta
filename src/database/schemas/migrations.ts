import { schemaMigrations } from '@nozbe/watermelondb/Schema/migrations';

export default schemaMigrations({
  migrations: [
    {
      toVersion: 1,
      steps: [
        // Migração inicial para criar o schema definido
        // O WatermelonDB criará as tabelas automaticamente com base no schema definido.
      ],
    },
  ],
});