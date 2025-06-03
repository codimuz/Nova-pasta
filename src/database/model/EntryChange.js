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
class EntryChange extends watermelondb_1.Model {
    static table = 'entry_changes';
    productCode;
    productName;
    oldQuantity;
    newQuantity;
    oldReasonId;
    newReasonId;
    changeDate;
    actionType;
}
exports.default = EntryChange;
__decorate([
    (0, decorators_1.text)('product_code'),
    __metadata("design:type", String)
], EntryChange.prototype, "productCode", void 0);
__decorate([
    (0, decorators_1.text)('product_name'),
    __metadata("design:type", String)
], EntryChange.prototype, "productName", void 0);
__decorate([
    (0, decorators_1.field)('old_quantity'),
    __metadata("design:type", Object)
], EntryChange.prototype, "oldQuantity", void 0);
__decorate([
    (0, decorators_1.field)('new_quantity'),
    __metadata("design:type", Number)
], EntryChange.prototype, "newQuantity", void 0);
__decorate([
    (0, decorators_1.text)('old_reason_id'),
    __metadata("design:type", Object)
], EntryChange.prototype, "oldReasonId", void 0);
__decorate([
    (0, decorators_1.text)('new_reason_id'),
    __metadata("design:type", String)
], EntryChange.prototype, "newReasonId", void 0);
__decorate([
    (0, decorators_1.date)('change_date'),
    __metadata("design:type", Date)
], EntryChange.prototype, "changeDate", void 0);
__decorate([
    (0, decorators_1.text)('action_type'),
    __metadata("design:type", String)
], EntryChange.prototype, "actionType", void 0);
