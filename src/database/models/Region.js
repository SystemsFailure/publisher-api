"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Region = void 0;
var mongoose_1 = require("mongoose");
var RegionSchema = new mongoose_1.Schema({
    createdAt: { type: Date, required: true, default: Date.now },
    _id: { type: mongoose_1.Schema.Types.ObjectId, default: function () { return new mongoose_1.Types.ObjectId(); } },
    name: { type: String, required: true },
    country: { type: String, required: true },
    code: { type: String, required: false },
});
exports.Region = (0, mongoose_1.model)('Region', RegionSchema);
