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
class Reason extends watermelondb_1.Model {
    static table = 'reasons';
    code; // Código textual do motivo (ex: '01', '02')
    description;
    createdAt;
    updatedAt;
}
exports.default = Reason;
__decorate([
    (0, decorators_1.text)('code'),
    __metadata("design:type", String)
], Reason.prototype, "code", void 0);
__decorate([
    (0, decorators_1.text)('description'),
    __metadata("design:type", String)
], Reason.prototype, "description", void 0);
__decorate([
    decorators_1.readonly,
    (0, decorators_1.date)('created_at'),
    __metadata("design:type", Date)
], Reason.prototype, "createdAt", void 0);
__decorate([
    decorators_1.readonly,
    (0, decorators_1.date)('updated_at'),
    __metadata("design:type", Date)
], Reason.prototype, "updatedAt", void 0);
