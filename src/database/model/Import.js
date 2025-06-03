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
class Import extends watermelondb_1.Model {
    static table = 'imports';
    fileName;
    importDate;
    itemsUpdated;
    itemsInserted;
    source;
}
exports.default = Import;
__decorate([
    (0, decorators_1.text)('file_name'),
    __metadata("design:type", String)
], Import.prototype, "fileName", void 0);
__decorate([
    (0, decorators_1.date)('import_date'),
    __metadata("design:type", Date)
], Import.prototype, "importDate", void 0);
__decorate([
    (0, decorators_1.field)('items_updated'),
    __metadata("design:type", Object)
], Import.prototype, "itemsUpdated", void 0);
__decorate([
    (0, decorators_1.field)('items_inserted'),
    __metadata("design:type", Object)
], Import.prototype, "itemsInserted", void 0);
__decorate([
    (0, decorators_1.text)('source'),
    __metadata("design:type", Object)
], Import.prototype, "source", void 0);
