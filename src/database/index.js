"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.database = void 0;
exports.initializeDatabase = initializeDatabase;
const watermelondb_1 = require("@nozbe/watermelondb");
const sqlite_1 = __importDefault(require("@nozbe/watermelondb/adapters/sqlite"));
const schema_1 = __importDefault(require("./schemas/schema"));
const migrations_1 = __importDefault(require("./schemas/migrations"));
const model_1 = require("./model");
const initialSeeder_1 = require("./seeders/initialSeeder");
const adapter = new sqlite_1.default({
    schema: schema_1.default,
    migrations: migrations_1.default,
    jsi: true, // Habilita o modo JSI para melhor performance
});
exports.database = new watermelondb_1.Database({
    adapter,
    modelClasses: model_1.models,
});
async function initializeDatabase() {
    console.log("WatermelonDB inicializado com schema versão:", schema_1.default.version);
    await (0, initialSeeder_1.runInitialSeeders)(exports.database); // Corrigido para importar corretamente
}
