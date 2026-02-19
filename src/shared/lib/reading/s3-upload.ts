import {
  CreateBucketCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

const endpoint = process.env.S3_ENDPOINT;
const region = process.env.S3_REGION ?? 'us-east-1';
const bucket = process.env.S3_BUCKET_NAME;
const accessKeyId = process.env.S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

let client: S3Client | null = null;

function getS3(): S3Client | null {
  if (client) return client;
  if (!bucket || !accessKeyId || !secretAccessKey) return null;
  client = new S3Client({
    region,
    ...(endpoint
      ? {
          endpoint,
          forcePathStyle: true,
          credentials: { accessKeyId, secretAccessKey },
        }
      : { credentials: { accessKeyId, secretAccessKey } }),
  });
  return client;
}

/** Ensure the bucket exists (e.g. MinIO does not auto-create on PutObject). */
async function ensureBucket(s3: S3Client, bucketName: string): Promise<void> {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucketName }));
  } catch (err: unknown) {
    const code = (err as { name?: string }).name;
    if (code === 'NotFound' || code === 'NoSuchBucket') {
      await s3.send(new CreateBucketCommand({ Bucket: bucketName }));
    } else {
      throw err;
    }
  }
}

export async function uploadAudioBuffer(
  key: string,
  body: Uint8Array,
  contentType: string,
): Promise<string | null> {
  const s3 = getS3();
  if (!s3 || !bucket) {
    console.error(
      '[s3-upload] Missing config: bucket, S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY are required.',
    );
    return null;
  }
  try {
    await ensureBucket(s3, bucket);
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
    if (endpoint) {
      const base = endpoint.replace(/\/$/, '');
      return `${base}/${bucket}/${key}`;
    }
    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  } catch (err) {
    console.error('[s3-upload] Upload failed:', err);
    return null;
  }
}

/**
 * Extract S3 object key from a stored URL we produced (e.g. http://localhost:9000/bucket/key).
 * Returns null if the URL is not from our S3/MinIO config.
 */
export function getKeyFromStoredUrl(storedUrl: string): string | null {
  if (!bucket || !endpoint) return null;
  const base = endpoint.replace(/\/$/, '');
  const prefix = `${base}/${bucket}/`;
  if (!storedUrl.startsWith(prefix)) return null;
  return storedUrl.slice(prefix.length);
}

/**
 * Stream an object from S3/MinIO by key. Use for private buckets (e.g. MinIO) so the
 * browser can play audio via a proxy route that sends the stream.
 */
export async function streamObjectByKey(
  key: string,
): Promise<{ body: ReadableStream | Blob; contentType: string } | null> {
  const s3 = getS3();
  if (!s3 || !bucket) return null;
  try {
    const response = await s3.send(
      new GetObjectCommand({ Bucket: bucket, Key: key }),
    );
    const body = response.Body;
    if (!body) return null;
    const contentType = response.ContentType ?? 'application/octet-stream';
    let webStream: ReadableStream;
    const b = body as {
      transformToWebStream?: () => ReadableStream;
      pipe?: unknown;
    };
    if (typeof b.transformToWebStream === 'function') {
      webStream = b.transformToWebStream();
    } else if (typeof (body as { pipe: unknown }).pipe === 'function') {
      const { Readable } = await import('node:stream');
      webStream = Readable.toWeb(
        body as InstanceType<typeof Readable>,
      ) as ReadableStream;
    } else {
      const bytes = await (
        body as { transformToByteArray?: () => Promise<Uint8Array> }
      ).transformToByteArray?.();
      if (!bytes) return null;
      webStream = new ReadableStream({
        start(controller) {
          controller.enqueue(bytes);
          controller.close();
        },
      });
    }
    return { body: webStream, contentType };
  } catch (err) {
    console.error('[s3-upload] GetObject failed:', err);
    return null;
  }
}
