import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fastify from "fastify";
import { r2 } from "../lib/r2";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { prisma } from "../lib/prisma";
import cors from '@fastify/cors';

const server = fastify();

server.register(cors, {
  origin: '*'
});

server.get('/', (request, reply) => {
    reply.send({ message: 'Hello, World!' });
});

server.post('/upload', async (request) => {

    const uploadSchema = z.object({
        name: z.string().min(1, "Name is required"),
        contentType: z.string().min(1, "Content type is required"),
    })

    const { name, contentType } = uploadSchema.parse(request.body);

    const fileKey = randomUUID().concat('-').concat(name);

    const signedUrl = await getSignedUrl(r2,
        new PutObjectCommand({
            Bucket: 'blackhole-dev',
            Key: fileKey,
            ContentType: contentType
        }),
        {
            expiresIn: 600, // 10 minutes
        }
    )

    const file = await prisma.file.create({
        data: {
            name,
            key: fileKey,
            type: contentType,
        }
    })

    return {
        signedUrl,
        fileId: file.id,
    };
})

server.get('/:id', async (request, response) => {
    const getFileSchema = z.object({
        id: z.string().cuid(),
    });

    const { id } = getFileSchema.parse(request.params);

    const file = await prisma.file.findUnique({
        where: { id },
    });

    if (!file) {
        response.status(404).send({ error: 'File not found' });
        return;
    }

    const signedUrl = await getSignedUrl(r2,
        new GetObjectCommand({
            Bucket: 'blackhole-dev',
            Key: file.key
        }),
        {
            expiresIn: 10 * 60 // 10 minutes
        }
    )

    return response.redirect(signedUrl, 301)
})

server.listen({
    port: 3333,
    host: '0.0.0.0'
}).then(() => {
    console.log('Server is listening on http://0.0.0.0:3333 🚀');
})