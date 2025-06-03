"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const migrations_1 = require("@nozbe/watermelondb/Schema/migrations");
exports.default = (0, migrations_1.schemaMigrations)({
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
