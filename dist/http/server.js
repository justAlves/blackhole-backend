"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const fastify_1 = __importDefault(require("fastify"));
const r2_1 = require("../lib/r2");
const client_s3_1 = require("@aws-sdk/client-s3");
const zod_1 = require("zod");
const node_crypto_1 = require("node:crypto");
const prisma_1 = require("../lib/prisma");
const cors_1 = __importDefault(require("@fastify/cors"));
const server = (0, fastify_1.default)();
server.register(cors_1.default, {
    origin: '*'
});
server.get('/', (request, reply) => {
    reply.send({ message: 'Hello, World!' });
});
server.post('/upload', (request) => __awaiter(void 0, void 0, void 0, function* () {
    const uploadSchema = zod_1.z.object({
        name: zod_1.z.string().min(1, "Name is required"),
        contentType: zod_1.z.string().min(1, "Content type is required"),
    });
    const { name, contentType } = uploadSchema.parse(request.body);
    const fileKey = (0, node_crypto_1.randomUUID)().concat('-').concat(name);
    const signedUrl = yield (0, s3_request_presigner_1.getSignedUrl)(r2_1.r2, new client_s3_1.PutObjectCommand({
        Bucket: 'blackhole-dev',
        Key: fileKey,
        ContentType: contentType
    }), {
        expiresIn: 600, // 10 minutes
    });
    const file = yield prisma_1.prisma.file.create({
        data: {
            name,
            key: fileKey,
            type: contentType,
        }
    });
    return {
        signedUrl,
        fileId: file.id,
    };
}));
server.get('/:id', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const getFileSchema = zod_1.z.object({
        id: zod_1.z.string().cuid(),
    });
    const { id } = getFileSchema.parse(request.params);
    const file = yield prisma_1.prisma.file.findUnique({
        where: { id },
    });
    if (!file) {
        response.status(404).send({ error: 'File not found' });
        return;
    }
    const signedUrl = yield (0, s3_request_presigner_1.getSignedUrl)(r2_1.r2, new client_s3_1.GetObjectCommand({
        Bucket: 'blackhole-dev',
        Key: file.key
    }), {
        expiresIn: 10 * 60 // 10 minutes
    });
    return response.redirect(signedUrl, 301);
}));
server.listen({
    port: 3333,
    host: '0.0.0.0'
}).then(() => {
    console.log('Server is listening on http://0.0.0.0:3333 🚀');
});
