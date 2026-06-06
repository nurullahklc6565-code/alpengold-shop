import { randomUUID } from "crypto";
import { extname } from "path";
import type { BaseStorageAdapter } from "./adapters/base.adapter";

class StorageService {
  private adapter: BaseStorageAdapter | null = null;

  private async resolveAdapter(): Promise<BaseStorageAdapter> {
    if (this.adapter) return this.adapter;

    const provider = process.env.STORAGE_PROVIDER ?? "local";

    if (provider === "local") {
      const { LocalAdapter } = await import("./adapters/local.adapter");
      this.adapter = new LocalAdapter();
    } else if (provider === "r2") {
      const { R2Adapter } = await import("./adapters/r2.adapter");
      this.adapter = new R2Adapter({
        accountId: process.env.STORAGE_ACCOUNT_ID ?? "",
        accessKeyId: process.env.STORAGE_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY ?? "",
        bucket: process.env.STORAGE_BUCKET ?? "",
        publicUrl: (process.env.STORAGE_PUBLIC_URL ?? "").replace(/\/$/, ""),
      });
    } else if (provider === "s3") {
      const { S3Adapter } = await import("./adapters/s3.adapter");
      this.adapter = new S3Adapter({
        region: process.env.STORAGE_REGION ?? "us-east-1",
        accessKeyId: process.env.STORAGE_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY ?? "",
        bucket: process.env.STORAGE_BUCKET ?? "",
        publicUrl: process.env.STORAGE_PUBLIC_URL
          ? process.env.STORAGE_PUBLIC_URL.replace(/\/$/, "")
          : undefined,
      });
    } else {
      const { LocalAdapter } = await import("./adapters/local.adapter");
      this.adapter = new LocalAdapter();
    }

    return this.adapter;
  }

  /** uploads/2026/06/<uuid>.ext formatında benzersiz key üretir */
  generateKey(originalFilename: string, folder = "uploads"): string {
    const ext = extname(originalFilename).toLowerCase() || ".bin";
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    return `${folder}/${yyyy}/${mm}/${randomUUID()}${ext}`;
  }

  async upload(params: { key: string; body: Buffer; contentType: string }) {
    const adapter = await this.resolveAdapter();
    return adapter.upload(params);
  }

  async delete(key: string) {
    const adapter = await this.resolveAdapter();
    return adapter.delete(key);
  }

  /** R2/S3 ortamlarında zorunlu env kontrolü — local her zaman hazır */
  isConfigured(): boolean {
    const provider = process.env.STORAGE_PROVIDER ?? "local";
    if (provider === "local") return true;
    return (
      !!process.env.STORAGE_BUCKET &&
      !!process.env.STORAGE_ACCESS_KEY_ID &&
      !!process.env.STORAGE_SECRET_ACCESS_KEY
    );
  }

  getProvider(): string {
    return process.env.STORAGE_PROVIDER ?? "local";
  }
}

export const storageService = new StorageService();
