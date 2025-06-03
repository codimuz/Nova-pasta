"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.models = void 0;
// src/database/model/index.ts
const Product_1 = __importDefault(require("./Product"));
const Reason_1 = __importDefault(require("./Reason"));
const Entry_1 = __importDefault(require("./Entry"));
const EntryChange_1 = __importDefault(require("./EntryChange"));
const Import_1 = __importDefault(require("./Import"));
exports.models = [
    Product_1.default,
    Reason_1.default,
    Entry_1.default,
    EntryChange_1.default,
    Import_1.default,
];
