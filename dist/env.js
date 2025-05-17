"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    R2_TOKEN: zod_1.z.string(),
    R2_ACCESS_KEY: zod_1.z.string(),
    R2_SECRET: zod_1.z.string(),
    R2_ENDPOINT: zod_1.z.string().url(),
    DATABASE_URL: zod_1.z.string().url(),
});
exports.env = envSchema.parse(process.env);
