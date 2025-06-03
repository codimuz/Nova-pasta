import { schemaMigrations } from '@nozbe/watermelondb/Schema/migrations';

export default schemaMigrations({
  migrations: [
    // Array vazio para schema inicial na versão 1
    // Quando schema.version é 1 e estamos criando o banco do zero,
    // não são necessárias migrações explícitas.
    // O WatermelonDB criará as tabelas automaticamente baseado no schema.
    
    // Futuras migrações serão adicionadas aqui quando necessário:
    // {
    //   toVersion: 2,
    //   steps: [
    //     // addColumn({ table: 'products', name: 'new_field', type: 'string' }),
    //     // createTable(...),
    //   ]
    // }
  ],
});
