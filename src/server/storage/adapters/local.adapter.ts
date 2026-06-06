import type { BaseStorageAdapter, UploadParams, UploadResult } from "./base.adapter";
import { mkdir, writeFile, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

/**
 * Geliştirme ortamı için yerel depolama adaptörü.
 * Dosyaları public/uploads/ klasörüne yazar; URL /uploads/... şeklinde olur.
 * Herhangi bir harici yapılandırma gerektirmez.
 */
export class LocalAdapter implements BaseStorageAdapter {
  readonly provider = "local";

  private publicDir(): string {
    return join(process.cwd(), "public");
  }

  async upload({ key, body }: UploadParams): Promise<UploadResult> {
    const filePath = join(this.publicDir(), key);
    const dir = filePath.substring(0, filePath.lastIndexOf("/"));

    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }

    await writeFile(filePath, body);
    return { url: `/${key}`, key };
  }

  async delete(key: string): Promise<void> {
    const filePath = join(this.publicDir(), key);
    try {
      await unlink(filePath);
    } catch {
      // Dosya zaten yoksa sessizce geç
    }
  }
}
