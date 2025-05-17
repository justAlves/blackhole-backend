"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.r2 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const env_1 = require("../env");
const r2 = new client_s3_1.S3Client({
    region: 'auto',
    endpoint: env_1.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: env_1.env.R2_ACCESS_KEY,
        secretAccessKey: env_1.env.R2_SECRET,
    }
});
exports.r2 = r2;
