/**
 * Storage adapter — uses Azure Blob Storage when credentials are available,
 * falls back to a local filesystem store (for dev/test).
 *
 * All callers depend only on the `StorageAdapter` interface,
 * so swapping providers requires no route/service changes.
 *
 * Required env vars (production):
 *   AZURE_STORAGE_CONNECTION_STRING — Azure Storage account connection string
 *   AZURE_STORAGE_CONTAINER         — Blob container name (default: brokerflow-attachments)
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
  }
}

// ─── Azure Blob Storage adapter ──────────────────────────────────────────────

class AzureBlobStorageAdapter implements StorageAdapter {
  private readonly connectionString: string;
  private readonly containerName: string;

  constructor() {
    this.connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING ?? '';
    this.containerName = process.env.AZURE_STORAGE_CONTAINER ?? 'brokerflow-attachments';
  }

  // Lazy-load the Azure SDK so the local adapter doesn't require it
  private async getContainerClient() {
    const { BlobServiceClient } = await import('@azure/storage-blob');
    const serviceClient = BlobServiceClient.fromConnectionString(this.connectionString);
    const containerClient = serviceClient.getContainerClient(this.containerName);
    // Ensure container exists (no-op if already present)
    await containerClient.createIfNotExists({ access: 'blob' });
    return containerClient;
  }

  async upload(key: string, body: Buffer | Readable, mimeType: string): Promise<UploadResult> {
    const containerClient = await this.getContainerClient();
    const blockBlobClient = containerClient.getBlockBlobClient(key);

    const buf =
      body instanceof Buffer
        ? body
        : await new Promise<Buffer>((resolve, reject) => {
            const chunks: Buffer[] = [];
            (body as Readable).on('data', (c: Buffer) => chunks.push(c));
            (body as Readable).on('end', () => resolve(Buffer.concat(chunks)));
            (body as Readable).on('error', reject);
          });

    await blockBlobClient.uploadData(buf, {
      blobHTTPHeaders: { blobContentType: mimeType },
    });

    return { url: blockBlobClient.url, key, bucket: this.containerName };
  }

  async delete(key: string): Promise<void> {
    const containerClient = await this.getContainerClient();
    const blockBlobClient = containerClient.getBlockBlobClient(key);
    await blockBlobClient.deleteIfExists();
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const { BlobServiceClient, BlobSASPermissions, generateBlobSASQueryParameters, StorageSharedKeyCredential } =
      await import('@azure/storage-blob');

    // Parse account name and key from the connection string
    const accountNameMatch = this.connectionString.match(/AccountName=([^;]+)/);
    const accountKeyMatch = this.connectionString.match(/AccountKey=([^;]+)/);

    if (!accountNameMatch || !accountKeyMatch) {
      // Fall back to direct URL when credentials cannot be parsed (e.g. SAS-based connection strings)
      const serviceClient = BlobServiceClient.fromConnectionString(this.connectionString);
      return `${serviceClient.url}/${this.containerName}/${key}`;
    }

    const accountName = accountNameMatch[1];
    const accountKey = accountKeyMatch[1];
    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

    const expiresOn = new Date(Date.now() + expiresIn * 1000);
    const sasQuery = generateBlobSASQueryParameters(
      {
        containerName: this.containerName,
        blobName: key,
        permissions: BlobSASPermissions.parse('r'),
        expiresOn,
      },
      sharedKeyCredential,
    ).toString();

    return `https://${accountName}.blob.core.windows.net/${this.containerName}/${key}?${sasQuery}`;
  }
}

// ─── Factory ─────────────────────────────────────────────────────────────────

function createStorageAdapter(): StorageAdapter {
  if (process.env.AZURE_STORAGE_CONNECTION_STRING) {
    return new AzureBlobStorageAdapter();
  }
  return new LocalStorageAdapter();
}

export const storage: StorageAdapter = createStorageAdapter();

export { LocalStorageAdapter, AzureBlobStorageAdapter };
