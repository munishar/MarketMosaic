/**
 * Storage adapter — uses AWS S3 when credentials are available,
 * falls back to a local filesystem store (for dev/test).
 *
 * All callers depend only on the `StorageAdapter` interface,
 * so swapping providers requires no route/service changes.
 */
import path from 'path';
import fs from 'fs';
import { Readable } from 'stream';

export interface UploadResult {
  url: string;
  key: string;
  bucket: string;
}

export interface StorageAdapter {
  upload(key: string, body: Buffer | Readable, mimeType: string): Promise<UploadResult>;
  delete(key: string): Promise<void>;
  getSignedUrl(key: string, expiresIn?: number): Promise<string>;
}

// ─── Local (dev/test) adapter ────────────────────────────────────────────────

class LocalStorageAdapter implements StorageAdapter {
  private readonly dir: string;
  private readonly baseUrl: string;

  constructor() {
    this.dir = process.env.LOCAL_STORAGE_DIR ?? '/tmp/brokerflow-uploads';
    this.baseUrl = process.env.LOCAL_STORAGE_BASE_URL ?? 'http://localhost:3001/uploads';
    if (!fs.existsSync(this.dir)) {
      fs.mkdirSync(this.dir, { recursive: true });
    }
  }

  async upload(key: string, body: Buffer | Readable, _mimeType: string): Promise<UploadResult> {
    // Sanitize: use only the basename to prevent path traversal
    const safeKey = path.basename(key.replace(/\//g, '_'));
    const filePath = path.join(this.dir, safeKey);
    // Additional guard: resolved path must stay within storage dir
    const resolved = path.resolve(filePath);
    if (!resolved.startsWith(path.resolve(this.dir) + path.sep) && resolved !== path.resolve(this.dir)) {
      throw new Error('Invalid storage key: path traversal detected');
    }
    const buf =
      body instanceof Buffer
        ? body
        : await new Promise<Buffer>((resolve, reject) => {
            const chunks: Buffer[] = [];
            (body as Readable).on('data', (c: Buffer) => chunks.push(c));
            (body as Readable).on('end', () => resolve(Buffer.concat(chunks)));
            (body as Readable).on('error', reject);
          });
    fs.writeFileSync(filePath, buf);
    return { url: `${this.baseUrl}/${key}`, key, bucket: 'local' };
  }

  async delete(key: string): Promise<void> {
    // Sanitize key to prevent path traversal
    const safeKey = path.basename(key.replace(/\//g, '_'));
    const filePath = path.join(this.dir, safeKey);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  async getSignedUrl(key: string, _expiresIn = 3600): Promise<string> {
    return `${this.baseUrl}/${key}`;
  }}

// ─── S3 adapter ──────────────────────────────────────────────────────────────

class S3StorageAdapter implements StorageAdapter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private client: any;
  private readonly bucket: string;
  private readonly region: string;

  constructor() {
    this.bucket = process.env.AWS_S3_BUCKET ?? 'brokerflow-attachments';
    this.region = process.env.AWS_REGION ?? 'us-east-1';
  }

  // Lazy-load the AWS SDK so the local adapter doesn't require it
  private async getClient() {
    if (!this.client) {
      const { S3Client } = await import('@aws-sdk/client-s3');
      this.client = new S3Client({ region: this.region });
    }
    return this.client as import('@aws-sdk/client-s3').S3Client;
  }

  async upload(key: string, body: Buffer | Readable, mimeType: string): Promise<UploadResult> {
    const { PutObjectCommand } = await import('@aws-sdk/client-s3');
    const client = await this.getClient();
    await client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: mimeType,
      }),
    );
    const url = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
    return { url, key, bucket: this.bucket };
  }

  async delete(key: string): Promise<void> {
    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    const client = await this.getClient();
    await client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  async getSignedUrl(key: string, _expiresIn = 3600): Promise<string> {
    // Returns a direct S3 URL; swap in @aws-sdk/s3-request-presigner for pre-signed URLs
    // when the package is added to dependencies.
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }
}

// ─── Factory ─────────────────────────────────────────────────────────────────

function createStorageAdapter(): StorageAdapter {
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    return new S3StorageAdapter();
  }
  return new LocalStorageAdapter();
}

export const storage: StorageAdapter = createStorageAdapter();

export { LocalStorageAdapter, S3StorageAdapter };
