"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Office = void 0;
var mongoose_1 = require("mongoose");
var OfficeSchema = new mongoose_1.Schema({
    createdAt: { type: Date, required: true, default: Date.now },
    code: { type: String, required: false, unique: true },
    name: { type: String, required: true },
    region: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Region', required: true },
    address: { type: String, required: true },
});
exports.Office = (0, mongoose_1.model)('Office', OfficeSchema);
