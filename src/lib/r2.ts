import { S3Client } from '@aws-sdk/client-s3'
import { env } from '../env'

const r2 = new S3Client({
    region: 'auto',
    endpoint: env.R2_ENDPOINT,
    credentials: {
        accessKeyId: env.R2_ACCESS_KEY,
        secretAccessKey: env.R2_SECRET,
    }
})

export {
    r2
}