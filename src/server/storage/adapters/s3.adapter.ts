import type { BaseStorageAdapter, UploadParams, UploadResult } from "./base.adapter";

/**
 * AWS S3 adaptörü.
 * Gerekli env: STORAGE_REGION, STORAGE_ACCESS_KEY_ID,
 *              STORAGE_SECRET_ACCESS_KEY, STORAGE_BUCKET
 * İsteğe bağlı: STORAGE_PUBLIC_URL (CDN varsa)
 * Çalışması için `npm install @aws-sdk/client-s3` gereklidir.
 */
export class S3Adapter implements BaseStorageAdapter {
  readonly provider = "s3";

  constructor(
    private readonly config: {
      region: string;
      accessKeyId: string;
      secretAccessKey: string;
      bucket: string;
      publicUrl?: string;
    }
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async getClient(): Promise<any> {
    try {
      const { S3Client } = await import(/* webpackIgnore: true */ "@aws-sdk/client-s3");
      return new S3Client({
        region: this.config.region,
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
        ACL: "public-read",
      })
    );
    const base =
      this.config.publicUrl ??
      `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com`;
    return { url: `${base}/${key}`, key };
  }

  async delete(key: string): Promise<void> {
    const { DeleteObjectCommand } = await import(/* webpackIgnore: true */ "@aws-sdk/client-s3");
    const client = await this.getClient();
    await client.send(
      new DeleteObjectCommand({ Bucket: this.config.bucket, Key: key })
    );
  }
}
