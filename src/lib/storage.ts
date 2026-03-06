import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const bucket = process.env.AWS_S3_BUCKET;
const region = process.env.AWS_S3_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

if (!bucket || !region || !accessKeyId || !secretAccessKey) {
  throw new Error('S3 environment variables are not fully set');
}

const s3 = new S3Client({
  region,
  endpoint: `https://s3.${region}.amazonaws.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  forcePathStyle: false,
});

export async function uploadImageToS3(fileBuffer: Buffer, key: string, contentType: string): Promise<string> {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
      // ACL removed as bucket doesn't allow ACLs
    }),
  );

  return key; // Return the key instead of public URL
}

export async function getSignedPhotoUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return getSignedUrl(s3, command, { expiresIn: 3600 }); // Valid for 1 hour
}

