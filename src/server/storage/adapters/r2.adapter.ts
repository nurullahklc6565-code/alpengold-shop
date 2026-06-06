import type { BaseStorageAdapter, UploadParams, UploadResult } from "./base.adapter";

/**
 * Cloudflare R2 adaptörü (S3-uyumlu API).
 * Gerekli env: STORAGE_ACCOUNT_ID, STORAGE_ACCESS_KEY_ID,
 *              STORAGE_SECRET_ACCESS_KEY, STORAGE_BUCKET, STORAGE_PUBLIC_URL
 * Çalışması için `npm install @aws-sdk/client-s3` gereklidir.
 */
export class R2Adapter implements BaseStorageAdapter {
  readonly provider = "r2";

  constructor(
    private readonly config: {
      accountId: string;
      accessKeyId: string;
      secretAccessKey: string;
      bucket: string;
      publicUrl: string;
    }
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async getClient(): Promise<any> {
    try {
      const { S3Client } = await import(/* webpackIgnore: true */ "@aws-sdk/client-s3");
      return new S3Client({
        region: "auto",
        endpoint: `https://${this.config.accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: this.config.accessKeyId,
          secretAccessKey: this.config.secretAccessKey,
        },
      });
    } catch {
      throw new Error(
        "@aws-sdk/client-s3 paketi kurulu değil. `npm install @aws-sdk/client-s3` komutunu çalıştırın."
      );
    }
  }

  async upload({ key, body, contentType }: UploadParams): Promise<UploadResult> {
    const { PutObjectCommand } = await import(/* webpackIgnore: true */ "@aws-sdk/client-s3");
    const client = await this.getClient();
    await client.send(
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
    );
    return { url: `${this.config.publicUrl}/${key}`, key };
  }

  async delete(key: string): Promise<void> {
    const { DeleteObjectCommand } = await import(/* webpackIgnore: true */ "@aws-sdk/client-s3");
    const client = await this.getClient();
    await client.send(
      new DeleteObjectCommand({ Bucket: this.config.bucket, Key: key })
    );
  }
}
