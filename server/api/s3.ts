import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import {defineEventHandler, readBody} from 'h3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';


export default defineEventHandler(async (event) => {
    console.log('🔧 [S3 API] Received upload request')

    const s3Config: any = {
        region: process.env.AMZ_REGION || 'us-east-2',
        credentials: {
            accessKeyId: process.env.AMZ_ACCESS_KEY_ID,
            secretAccessKey: process.env.AMZ_SECRET_ACCESS_KEY,
        },
    }

    console.log('🔧 [S3 API] S3 Config:', {
        region: s3Config.region,
        bucket: process.env.AMZ_BUCKET_NAME,
        hasAccessKey: !!process.env.AMZ_ACCESS_KEY_ID,
        hasSecretKey: !!process.env.AMZ_SECRET_ACCESS_KEY
    })

    const s3Client = new S3Client(s3Config);

    const upload = await readBody(event);
    console.log('🔧 [S3 API] Upload request body:', upload)

    const command = new PutObjectCommand({
        Bucket: process.env.AMZ_BUCKET_NAME,
        Key: upload.fileName,
        ACL: 'public-read',
    })

    try {
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        console.log('✅ [S3 API] Generated signed URL successfully')
        console.log('🔗 [S3 API] URL:', signedUrl.substring(0, 100) + '...')
        return signedUrl;
    } catch (err) {
        console.error('❌ [S3 API] Error generating signed URL:', err)
        console.error('❌ [S3 API] Error details:', {
            message: err.message,
            code: err.code,
            name: err.name
        })
        throw err;
    }
});
