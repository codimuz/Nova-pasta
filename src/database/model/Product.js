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
Object.defineProperty(exports, "__esModule", { value: true });
const watermelondb_1 = require("@nozbe/watermelondb");
const decorators_1 = require("@nozbe/watermelondb/decorators");
class Product extends watermelondb_1.Model {
    static table = 'products';
    productCode;
    productName;
    regularPrice;
    clubPrice;
    unitType;
    createdAt;
    updatedAt;
    deletedAt;
    restoredAt;
}
exports.default = Product;
__decorate([
    (0, decorators_1.text)('product_code'),
    __metadata("design:type", String)
], Product.prototype, "productCode", void 0);
__decorate([
    (0, decorators_1.text)('product_name'),
    __metadata("design:type", String)
], Product.prototype, "productName", void 0);
__decorate([
    (0, decorators_1.field)('regular_price'),
    __metadata("design:type", Number)
], Product.prototype, "regularPrice", void 0);
__decorate([
    (0, decorators_1.field)('club_price'),
    __metadata("design:type", Number)
], Product.prototype, "clubPrice", void 0);
__decorate([
    (0, decorators_1.text)('unit_type'),
    __metadata("design:type", String)
], Product.prototype, "unitType", void 0);
__decorate([
    decorators_1.readonly,
    (0, decorators_1.date)('created_at'),
    __metadata("design:type", Date)
], Product.prototype, "createdAt", void 0);
__decorate([
    decorators_1.readonly,
    (0, decorators_1.date)('updated_at'),
    __metadata("design:type", Date)
], Product.prototype, "updatedAt", void 0);
__decorate([
    (0, decorators_1.date)('deleted_at'),
    __metadata("design:type", Object)
], Product.prototype, "deletedAt", void 0);
__decorate([
    (0, decorators_1.date)('restored_at'),
    __metadata("design:type", Object)
], Product.prototype, "restoredAt", void 0);
