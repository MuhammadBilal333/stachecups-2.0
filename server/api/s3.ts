import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import {defineEventHandler, readBody} from 'h3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';


export default defineEventHandler(async (event) => {
    const s3Config: any = {
        region: process.env.AMZ_REGION || 'us-east-2',
        credentials: {
            accessKeyId: process.env.AMZ_ACCESS_KEY_ID,
            secretAccessKey: process.env.AMZ_SECRET_ACCESS_KEY,
        },
    }

    const s3Client = new S3Client(s3Config);

    const upload = await readBody(event);

    const command = new PutObjectCommand({
        Bucket: process.env.AMZ_BUCKET_NAME,
        Key: upload.fileName,
        ACL: 'public-read',
    })

    try {
        return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    } catch (err) {
        console.error('Error creating signed URL', err);
        throw err;
    }
});
