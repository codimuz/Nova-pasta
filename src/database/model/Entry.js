"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const watermelondb_1 = require("@nozbe/watermelondb");
const decorators_1 = require("@nozbe/watermelondb/decorators");
const Product_1 = __importDefault(require("./Product"));
const Reason_1 = __importDefault(require("./Reason"));
class Entry extends watermelondb_1.Model {
    static table = 'entries';
    productCodeValue; // Código de barras textual
    productName; // Nome do produto (denormalizado)
    quantity;
    reasonCodeValue; // Código textual do motivo (ex: '01')
    entryDate;
    isSynchronized;
    // Relacionamentos com IDs do WatermelonDB
    linkedProductId;
    product;
    linkedReasonId;
    reason;
}
exports.default = Entry;
__decorate([
    (0, decorators_1.text)('product_code_value'),
    __metadata("design:type", String)
], Entry.prototype, "productCodeValue", void 0);
__decorate([
    (0, decorators_1.text)('product_name'),
    __metadata("design:type", String)
], Entry.prototype, "productName", void 0);
__decorate([
    (0, decorators_1.field)('quantity'),
    __metadata("design:type", Number)
], Entry.prototype, "quantity", void 0);
__decorate([
    (0, decorators_1.text)('reason_code_value'),
    __metadata("design:type", String)
], Entry.prototype, "reasonCodeValue", void 0);
__decorate([
    (0, decorators_1.date)('entry_date'),
    __metadata("design:type", Date)
], Entry.prototype, "entryDate", void 0);
__decorate([
    (0, decorators_1.field)('is_synchronized'),
    __metadata("design:type", Boolean)
], Entry.prototype, "isSynchronized", void 0);
__decorate([
    decorators_1.readonly,
    (0, decorators_1.text)('linked_product_id'),
    __metadata("design:type", String)
], Entry.prototype, "linkedProductId", void 0);
__decorate([
    (0, decorators_1.relation)('products', 'linked_product_id'),
    __metadata("design:type", Product_1.default)
], Entry.prototype, "product", void 0);
__decorate([
    decorators_1.readonly,
    (0, decorators_1.text)('linked_reason_id'),
    __metadata("design:type", String)
], Entry.prototype, "linkedReasonId", void 0);
__decorate([
    (0, decorators_1.relation)('reasons', 'linked_reason_id'),
    __metadata("design:type", Reason_1.default)
], Entry.prototype, "reason", void 0);
